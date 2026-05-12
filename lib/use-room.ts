"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";
import { createPeerConnection } from "./webrtc";

/* ============================================================
   Types
   ============================================================ */

export interface RemotePeer {
  id: string;
  name: string;
  stream: MediaStream | null;
  connectionState: RTCPeerConnectionState;
}

type SignalingMessage =
  | { type: "offer"; from: string; to: string; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; from: string; to: string; sdp: RTCSessionDescriptionInit }
  | { type: "ice"; from: string; to: string; candidate: RTCIceCandidateInit };

interface UseRoomResult {
  myId: string;
  peers: RemotePeer[];
  connected: boolean;
  error: string | null;
}

/* ============================================================
   Hook — useRoom
   ============================================================
   Joins a Supabase Realtime channel for the given room code,
   announces presence, and sets up a WebRTC mesh with every
   other peer present in the room.
   ============================================================ */

export function useRoom(
  roomId: string | null,
  localStream: MediaStream | null,
  displayName: string
): UseRoomResult {
  const [myId] = useState(() => `p_${Math.random().toString(36).slice(2, 10)}`);
  const [peers, setPeers] = useState<RemotePeer[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs — avoid stale-closure problems by always reading current state from refs
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const peerConnsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const knownPeersRef = useRef<Map<string, { name: string }>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(localStream);

  // Keep ref in sync with prop so async callbacks always see the latest stream.
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  /* ----------------------------------------------------------
     Sync local stream tracks to all open peer connections.
     Called whenever the local stream changes (start camera,
     swap camera for screen, etc.).
     ---------------------------------------------------------- */
  const syncLocalTracks = useCallback(() => {
    const stream = localStreamRef.current;
    peerConnsRef.current.forEach((pc) => {
      const senders = pc.getSenders();
      if (!stream) return;
      stream.getTracks().forEach((track) => {
        const matchingSender = senders.find(
          (s) => s.track && s.track.kind === track.kind
        );
        if (matchingSender) {
          // Hot-swap the track — no renegotiation needed for same kind
          matchingSender.replaceTrack(track).catch(() => {});
        } else {
          pc.addTrack(track, stream);
        }
      });
    });
  }, []);

  useEffect(() => {
    syncLocalTracks();
  }, [localStream, syncLocalTracks]);

  /* ----------------------------------------------------------
     Re-render helper — bump state when remote streams update.
     We store streams in refs so the WebRTC machinery doesn't
     re-run on every render, but the UI still needs to know.
     ---------------------------------------------------------- */
  const rebuildPeerList = useCallback(() => {
    const list: RemotePeer[] = [];
    knownPeersRef.current.forEach((info, id) => {
      if (id === myId) return;
      const pc = peerConnsRef.current.get(id);
      list.push({
        id,
        name: info.name,
        stream: remoteStreamsRef.current.get(id) ?? null,
        connectionState: pc?.connectionState ?? "new",
      });
    });
    setPeers(list);
  }, [myId]);

  /* ----------------------------------------------------------
     Create a peer connection for a remote peer.
     Wires up all event handlers and adds local tracks.
     ---------------------------------------------------------- */
  const createPeerFor = useCallback(
    (peerId: string): RTCPeerConnection => {
      const existing = peerConnsRef.current.get(peerId);
      if (existing) return existing;

      const pc = createPeerConnection();
      peerConnsRef.current.set(peerId, pc);

      // Add local tracks (camera, mic) so the remote peer receives them
      const stream = localStreamRef.current;
      if (stream) {
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      }

      // Remote tracks arrive here. We bucket them all into one MediaStream
      // per peer so the UI just renders <video srcObject={remotePeer.stream}>.
      pc.ontrack = (event) => {
        let remoteStream = remoteStreamsRef.current.get(peerId);
        if (!remoteStream) {
          remoteStream = new MediaStream();
          remoteStreamsRef.current.set(peerId, remoteStream);
        }
        remoteStream.addTrack(event.track);
        rebuildPeerList();
      };

      // ICE candidates — send via signaling channel as they're discovered
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal({
            type: "ice",
            from: myId,
            to: peerId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      pc.onconnectionstatechange = () => {
        rebuildPeerList();
        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          // Cleanup; the peer might rejoin via a fresh offer
          peerConnsRef.current.delete(peerId);
          remoteStreamsRef.current.delete(peerId);
          rebuildPeerList();
        }
      };

      return pc;
    },
    [myId, rebuildPeerList]
  );

  /* ----------------------------------------------------------
     Send a signaling message over the Supabase channel.
     ---------------------------------------------------------- */
  const sendSignal = useCallback((msg: SignalingMessage) => {
    const channel = channelRef.current;
    if (!channel) return;
    channel.send({ type: "broadcast", event: "signal", payload: msg });
  }, []);

  /* ----------------------------------------------------------
     Main effect — join the channel, set up handlers, cleanup.
     Re-runs only if roomId changes (joining a different room).
     ---------------------------------------------------------- */
  useEffect(() => {
    if (!roomId || !isSupabaseConfigured || !supabase) {
      return;
    }

    setError(null);
    setConnected(false);

    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        broadcast: { self: false, ack: false },
        presence: { key: myId },
      },
    });
    channelRef.current = channel;

    /* Handle presence updates — when remote peers join/leave */
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const seen = new Set<string>();

      // Update knownPeers from current presence state
      Object.entries(state).forEach(([key, presences]) => {
        if (key === myId) return;
        seen.add(key);
        const first = (presences as Array<{ name?: string }>)[0];
        knownPeersRef.current.set(key, { name: first?.name ?? "Friend" });
      });

      // Drop peers no longer present
      Array.from(knownPeersRef.current.keys()).forEach((id) => {
        if (!seen.has(id)) {
          knownPeersRef.current.delete(id);
          const pc = peerConnsRef.current.get(id);
          pc?.close();
          peerConnsRef.current.delete(id);
          remoteStreamsRef.current.delete(id);
        }
      });

      rebuildPeerList();
    });

    /* When a NEW peer joins, the existing peers initiate the offer.
       (This avoids the "both peers offer simultaneously" race.) */
    channel.on("presence", { event: "join" }, async ({ key, newPresences }) => {
      if (key === myId) return;
      const first = (newPresences as Array<{ name?: string }>)[0];
      knownPeersRef.current.set(key, { name: first?.name ?? "Friend" });

      // Tie-break: only the peer with the smaller id sends the offer.
      // This guarantees exactly one offer per peer pair.
      if (myId < key) {
        const pc = createPeerFor(key);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignal({ type: "offer", from: myId, to: key, sdp: offer });
        } catch (e) {
          console.warn("[room] offer failed", e);
        }
      }

      rebuildPeerList();
    });

    /* Receive signaling messages from other peers */
    channel.on("broadcast", { event: "signal" }, async ({ payload }) => {
      const msg = payload as SignalingMessage;
      if (msg.to !== myId) return;

      if (msg.type === "offer") {
        const pc = createPeerFor(msg.from);
        try {
          await pc.setRemoteDescription(msg.sdp);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal({
            type: "answer",
            from: myId,
            to: msg.from,
            sdp: answer,
          });
        } catch (e) {
          console.warn("[room] handling offer failed", e);
        }
      } else if (msg.type === "answer") {
        const pc = peerConnsRef.current.get(msg.from);
        if (pc) {
          try {
            await pc.setRemoteDescription(msg.sdp);
          } catch (e) {
            console.warn("[room] handling answer failed", e);
          }
        }
      } else if (msg.type === "ice") {
        const pc = peerConnsRef.current.get(msg.from);
        if (pc) {
          try {
            await pc.addIceCandidate(msg.candidate);
          } catch (e) {
            // ICE candidates often arrive before remote description is set;
            // that's fine — they'll be re-tried.
          }
        }
      }
    });

    /* Subscribe + track presence */
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ name: displayName, joinedAt: Date.now() });
        setConnected(true);
      } else if (status === "CHANNEL_ERROR") {
        setError("Could not reach the realtime channel.");
        setConnected(false);
      } else if (status === "TIMED_OUT") {
        setError("Connection timed out — try refreshing.");
        setConnected(false);
      }
    });

    /* Cleanup on unmount or roomId change */
    return () => {
      peerConnsRef.current.forEach((pc) => pc.close());
      peerConnsRef.current.clear();
      remoteStreamsRef.current.clear();
      knownPeersRef.current.clear();
      setPeers([]);
      setConnected(false);
      supabase!.removeChannel(channel);
      channelRef.current = null;
    };
  }, [roomId, myId, displayName, createPeerFor, rebuildPeerList, sendSignal]);

  return { myId, peers, connected, error };
}
