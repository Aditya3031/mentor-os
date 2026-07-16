"use client";

/**
 * Study rooms — presence + voice.
 *
 * Rooms are persistent named spaces (Discord-style channels). Joining a
 * room announces your presence (name, subject, timer state); joining
 * VOICE inside a room builds a WebRTC audio mesh with everyone else in
 * voice, with mute / deafen / speaking detection.
 *
 * Signaling is pluggable:
 *  - SupabaseTransport  — presence + broadcast over Supabase Realtime
 *                         (used when env vars are configured; cross-network)
 *  - LocalTransport     — BroadcastChannel (no backend; same-device tabs,
 *                         used in local dev so the feature always works)
 *
 * The engine lives outside React so calls survive route navigation —
 * you stay in the room while browsing the rest of the app.
 */

import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "./supabase";
import { useStore } from "./store";

/* ============================================================
   Rooms registry
   ============================================================ */

export interface StudyRoom {
  id: string;
  name: string;
  motto: string;
  /** House rule shown in the room header */
  rule: "voice ok" | "mics muted" | "quiet";
}

export const STUDY_ROOMS: StudyRoom[] = [
  { id: "lounge", name: "Focus Lounge", motto: "Casual co-work. Talking is fine.", rule: "voice ok" },
  { id: "hall", name: "Deep Work Hall", motto: "Voice on, mics muted. Presence is the point.", rule: "mics muted" },
  { id: "grind", name: "The Grind", motto: "Sprint together. Short check-ins between pomodoros.", rule: "voice ok" },
  { id: "owls", name: "Night Owls", motto: "The late shift. Keep it low.", rule: "quiet" },
];

export function getRoom(id: string): StudyRoom | undefined {
  return STUDY_ROOMS.find((r) => r.id === id);
}

/* ============================================================
   Types
   ============================================================ */

export interface RoomMember {
  id: string;
  name: string;
  subject: string;
  mode: string;
  running: boolean;
  inVoice: boolean;
  muted: boolean;
  speaking?: boolean;
}

type SignalMsg =
  | { kind: "offer"; from: string; to: string; sdp: string }
  | { kind: "answer"; from: string; to: string; sdp: string }
  | { kind: "ice"; from: string; to: string; candidate: RTCIceCandidateInit };

interface TransportCallbacks {
  onMembers(members: RoomMember[]): void;
  onSignal(msg: SignalMsg): void;
}

interface Transport {
  join(cb: TransportCallbacks): Promise<void>;
  /** Update own presence meta (name/subject/mute/voice state) */
  track(meta: Omit<RoomMember, "id">): void;
  send(msg: SignalMsg): void;
  leave(): void;
}

/* ============================================================
   Supabase transport — cross-network presence + signaling
   ============================================================ */

class SupabaseTransport implements Transport {
  private channel: ReturnType<NonNullable<typeof supabase>["channel"]> | null = null;
  private meta: Omit<RoomMember, "id"> | null = null;

  constructor(private roomId: string, private selfId: string) {}

  async join(cb: TransportCallbacks) {
    const ch = supabase!.channel(`studyroom:${this.roomId}`, {
      config: { presence: { key: this.selfId }, broadcast: { self: false } },
    });
    this.channel = ch;

    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState<Omit<RoomMember, "id">>();
      const members: RoomMember[] = Object.entries(state).map(([id, metas]) => ({
        id,
        ...(metas[0] as Omit<RoomMember, "id">),
      }));
      cb.onMembers(members);
    });

    ch.on("broadcast", { event: "signal" }, ({ payload }) => {
      const msg = payload as SignalMsg;
      if (msg.to === this.selfId) cb.onSignal(msg);
    });

    await new Promise<void>((resolve, reject) => {
      ch.subscribe((status) => {
        if (status === "SUBSCRIBED") resolve();
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
          reject(new Error(`realtime ${status}`));
      });
    });
    if (this.meta) void ch.track(this.meta);
  }

  track(meta: Omit<RoomMember, "id">) {
    this.meta = meta;
    void this.channel?.track(meta);
  }

  send(msg: SignalMsg) {
    void this.channel?.send({ type: "broadcast", event: "signal", payload: msg });
  }

  leave() {
    if (this.channel) void supabase!.removeChannel(this.channel);
    this.channel = null;
  }
}

/* ============================================================
   Local transport — BroadcastChannel presence + signaling.
   Same-device tabs only; keeps rooms fully working without a
   backend (dev, demos, offline).
   ============================================================ */

const LOCAL_HEARTBEAT_MS = 2500;
const LOCAL_EVICT_MS = 7000;

type LocalWire =
  | { t: "state"; id: string; meta: Omit<RoomMember, "id"> }
  | { t: "bye"; id: string }
  | { t: "signal"; msg: SignalMsg };

class LocalTransport implements Transport {
  private bc: BroadcastChannel | null = null;
  private peers = new Map<string, { meta: Omit<RoomMember, "id">; seen: number }>();
  private meta: Omit<RoomMember, "id"> | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private cb: TransportCallbacks | null = null;

  constructor(private roomId: string, private selfId: string) {}

  async join(cb: TransportCallbacks) {
    this.cb = cb;
    this.bc = new BroadcastChannel(`ff-room:${this.roomId}`);
    this.bc.onmessage = (e: MessageEvent<LocalWire>) => {
      const w = e.data;
      if (w.t === "state" && w.id !== this.selfId) {
        this.peers.set(w.id, { meta: w.meta, seen: Date.now() });
        this.emit();
      } else if (w.t === "bye") {
        this.peers.delete(w.id);
        this.emit();
      } else if (w.t === "signal" && w.msg.to === this.selfId) {
        cb.onSignal(w.msg);
      }
    };
    this.timer = setInterval(() => {
      if (this.meta) this.post({ t: "state", id: this.selfId, meta: this.meta });
      const cutoff = Date.now() - LOCAL_EVICT_MS;
      let changed = false;
      for (const [id, p] of this.peers)
        if (p.seen < cutoff) {
          this.peers.delete(id);
          changed = true;
        }
      if (changed) this.emit();
    }, LOCAL_HEARTBEAT_MS);
  }

  private post(w: LocalWire) {
    try {
      this.bc?.postMessage(w);
    } catch {
      /* channel closed */
    }
  }

  private emit() {
    const members: RoomMember[] = [
      ...(this.meta ? [{ id: this.selfId, ...this.meta }] : []),
      ...[...this.peers.entries()].map(([id, p]) => ({ id, ...p.meta })),
    ];
    this.cb?.onMembers(members);
  }

  track(meta: Omit<RoomMember, "id">) {
    this.meta = meta;
    this.post({ t: "state", id: this.selfId, meta });
    this.emit();
  }

  send(msg: SignalMsg) {
    this.post({ t: "signal", msg });
  }

  leave() {
    this.post({ t: "bye", id: this.selfId });
    if (this.timer) clearInterval(this.timer);
    this.bc?.close();
    this.bc = null;
    this.peers.clear();
  }
}

/* ============================================================
   Store — UI-facing state
   ============================================================ */

export type VoiceStatus = "off" | "connecting" | "connected" | "error";

interface RoomsState {
  roomId: string | null;
  members: RoomMember[];
  transport: "net" | "lan" | null;
  voiceStatus: VoiceStatus;
  voiceError: string | null;
  /** True when mic was unavailable and we joined listen-only */
  listenOnly: boolean;
  selfMuted: boolean;
  deafened: boolean;
  /** peerId → speaking */
  speaking: Record<string, boolean>;
  /** roomId → member names currently inside (from the lobby channel) */
  lobby: Record<string, string[]>;

  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => void;
  joinVoice: () => Promise<void>;
  leaveVoice: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
}

export const useRooms = create<RoomsState>()((set) => ({
  roomId: null,
  members: [],
  transport: null,
  voiceStatus: "off",
  voiceError: null,
  listenOnly: false,
  selfMuted: false,
  deafened: false,
  speaking: {},
  lobby: {},

  joinRoom: (roomId) => engine.joinRoom(roomId),
  leaveRoom: () => engine.leaveRoom(),
  joinVoice: () => engine.joinVoice(),
  leaveVoice: () => engine.leaveVoice(),
  toggleMute: () => engine.toggleMute(),
  toggleDeafen: () => engine.toggleDeafen(),
}));

/* ============================================================
   Engine — module singleton, survives route changes
   ============================================================ */

const ICE_SERVERS: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
];

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

class RoomEngine {
  private selfId = randomId();
  private transport: Transport | null = null;
  private roomId: string | null = null;

  /* voice */
  private pcs = new Map<string, RTCPeerConnection>();
  private audioEls = new Map<string, HTMLAudioElement>();
  private localStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private analysers = new Map<string, { analyser: AnalyserNode; source: MediaStreamAudioSourceNode }>();
  private speakTimer: ReturnType<typeof setInterval> | null = null;
  private storeUnsub: (() => void) | null = null;

  /* ---------- lobby (occupancy counts on the room list) ---------- */

  private lobbyTransport: Transport | null = null;

  /**
   * Watch who is in which room. Piggybacks on the room Transport with
   * the reserved id "lobby"; the member `subject` field carries the
   * roomId there. Read-only until you join a room.
   */
  async watchLobby() {
    if (this.lobbyTransport) return;
    const t = isSupabaseConfigured
      ? new SupabaseTransport("lobby", this.selfId)
      : new LocalTransport("lobby", this.selfId);
    this.lobbyTransport = t;
    try {
      await t.join({
        onMembers: (members) => {
          const lobby: Record<string, string[]> = {};
          for (const m of members) {
            if (!m.subject) continue; // watchers / users not in a room
            (lobby[m.subject] ??= []).push(m.name);
          }
          useRooms.setState({ lobby });
        },
        onSignal: () => {},
      });
      this.trackLobby();
    } catch {
      this.lobbyTransport = null;
    }
  }

  private trackLobby() {
    if (!this.lobbyTransport) return;
    this.lobbyTransport.track({
      name: this.displayName(),
      subject: this.roomId ?? "", // "" = just watching
      mode: "",
      running: false,
      inVoice: false,
      muted: false,
    });
  }

  private displayName() {
    return (
      (typeof window !== "undefined" &&
        (window as { __ffUserName?: string }).__ffUserName) ||
      `guest-${this.selfId.slice(0, 4)}`
    );
  }

  /* ---------- room presence ---------- */

  async joinRoom(roomId: string) {
    if (this.roomId === roomId) return;
    this.leaveRoom();
    this.roomId = roomId;

    const transport = isSupabaseConfigured
      ? new SupabaseTransport(roomId, this.selfId)
      : new LocalTransport(roomId, this.selfId);
    this.transport = transport;

    useRooms.setState({
      roomId,
      transport: isSupabaseConfigured ? "net" : "lan",
      members: [],
    });

    try {
      await transport.join({
        onMembers: (members) => {
          useRooms.setState({ members });
          this.reconcilePeers(members);
        },
        onSignal: (msg) => void this.onSignal(msg),
      });
      this.trackPresence();
      this.trackLobby();

      // Mirror subject / timer changes into presence (throttled by equality).
      let last = "";
      this.storeUnsub = useStore.subscribe((s) => {
        const key = `${s.currentSubject}|${s.mode}|${s.running}`;
        if (key !== last) {
          last = key;
          this.trackPresence();
        }
      });
    } catch (err) {
      useRooms.setState({
        roomId: null,
        transport: null,
        voiceError: err instanceof Error ? err.message : "room join failed",
      });
      this.roomId = null;
      this.transport = null;
    }
  }

  leaveRoom() {
    this.leaveVoice();
    this.storeUnsub?.();
    this.storeUnsub = null;
    this.transport?.leave();
    this.transport = null;
    this.roomId = null;
    useRooms.setState({ roomId: null, members: [], transport: null });
    this.trackLobby();
  }

  private trackPresence() {
    if (!this.transport) return;
    const app = useStore.getState();
    const rooms = useRooms.getState();
    this.transport.track({
      name: this.displayName(),
      subject: app.currentSubject,
      mode: app.mode,
      running: app.running,
      inVoice: rooms.voiceStatus === "connected" || rooms.voiceStatus === "connecting",
      muted: rooms.selfMuted,
    });
  }

  /* ---------- voice mesh ---------- */

  async joinVoice() {
    if (!this.transport || useRooms.getState().voiceStatus !== "off") return;
    useRooms.setState({ voiceStatus: "connecting", voiceError: null });

    try {
      this.audioCtx ??= new AudioContext();
      await this.audioCtx.resume();
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        useRooms.setState({ listenOnly: false });
      } catch {
        // No mic (denied / missing) → listen-only with a silent track so
        // the mesh still forms and you can hear the room.
        const dest = this.audioCtx.createMediaStreamDestination();
        this.localStream = dest.stream;
        useRooms.setState({ listenOnly: true, selfMuted: true });
      }
      this.watchSpeaking("self", this.localStream);
      this.startSpeakTimer();
      useRooms.setState({ voiceStatus: "connected" });
      this.trackPresence();
      // Presence refresh triggers reconcilePeers on all sides; existing
      // voice members will now appear to us and we to them.
      this.reconcilePeers(useRooms.getState().members);
    } catch (err) {
      useRooms.setState({
        voiceStatus: "error",
        voiceError: err instanceof Error ? err.message : "voice failed",
      });
    }
  }

  leaveVoice() {
    for (const pc of this.pcs.values()) pc.close();
    this.pcs.clear();
    for (const el of this.audioEls.values()) el.remove();
    this.audioEls.clear();
    for (const { source } of this.analysers.values()) source.disconnect();
    this.analysers.clear();
    if (this.speakTimer) clearInterval(this.speakTimer);
    this.speakTimer = null;
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
    useRooms.setState({
      voiceStatus: "off",
      speaking: {},
      listenOnly: false,
      deafened: false,
    });
    this.trackPresence();
  }

  toggleMute() {
    const { selfMuted, listenOnly } = useRooms.getState();
    if (listenOnly) return; // nothing to unmute
    const next = !selfMuted;
    this.localStream?.getAudioTracks().forEach((t) => (t.enabled = !next));
    useRooms.setState({ selfMuted: next });
    this.trackPresence();
  }

  toggleDeafen() {
    const next = !useRooms.getState().deafened;
    for (const el of this.audioEls.values()) el.muted = next;
    // Discord convention: deafen also mutes your mic.
    if (next) {
      this.localStream?.getAudioTracks().forEach((t) => (t.enabled = false));
      useRooms.setState({ deafened: true, selfMuted: true });
    } else {
      const { selfMuted } = useRooms.getState();
      this.localStream?.getAudioTracks().forEach((t) => (t.enabled = !selfMuted));
      useRooms.setState({ deafened: false });
    }
    this.trackPresence();
  }

  /** Open/close peer connections to match who's in voice. */
  private reconcilePeers(members: RoomMember[]) {
    if (useRooms.getState().voiceStatus !== "connected") return;
    const inVoice = new Set(
      members.filter((m) => m.inVoice && m.id !== this.selfId).map((m) => m.id)
    );
    // close dropped
    for (const [id, pc] of this.pcs)
      if (!inVoice.has(id)) {
        pc.close();
        this.pcs.delete(id);
        this.audioEls.get(id)?.remove();
        this.audioEls.delete(id);
        this.dropAnalyser(id);
      }
    // dial new — deterministic initiator avoids offer glare
    for (const id of inVoice)
      if (!this.pcs.has(id) && this.selfId < id) void this.dial(id);
  }

  private newPc(peerId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.pcs.set(peerId, pc);

    this.localStream?.getTracks().forEach((t) => pc.addTrack(t, this.localStream!));

    pc.onicecandidate = (e) => {
      if (e.candidate)
        this.transport?.send({
          kind: "ice",
          from: this.selfId,
          to: peerId,
          candidate: e.candidate.toJSON(),
        });
    };

    pc.ontrack = (e) => {
      const stream = e.streams[0] ?? new MediaStream([e.track]);
      let el = this.audioEls.get(peerId);
      if (!el) {
        el = document.createElement("audio");
        el.autoplay = true;
        el.dataset.peer = peerId;
        el.muted = useRooms.getState().deafened;
        document.body.appendChild(el);
        this.audioEls.set(peerId, el);
      }
      el.srcObject = stream;
      this.watchSpeaking(peerId, stream);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed") {
        pc.close();
        this.pcs.delete(peerId);
        this.dropAnalyser(peerId);
      }
    };

    return pc;
  }

  private async dial(peerId: string) {
    const pc = this.newPc(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.transport?.send({
      kind: "offer",
      from: this.selfId,
      to: peerId,
      sdp: offer.sdp!,
    });
  }

  private async onSignal(msg: SignalMsg) {
    if (msg.kind === "offer") {
      let pc = this.pcs.get(msg.from);
      if (!pc) pc = this.newPc(msg.from);
      await pc.setRemoteDescription({ type: "offer", sdp: msg.sdp });
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.transport?.send({
        kind: "answer",
        from: this.selfId,
        to: msg.from,
        sdp: answer.sdp!,
      });
    } else if (msg.kind === "answer") {
      const pc = this.pcs.get(msg.from);
      if (pc && pc.signalingState === "have-local-offer")
        await pc.setRemoteDescription({ type: "answer", sdp: msg.sdp });
    } else if (msg.kind === "ice") {
      const pc = this.pcs.get(msg.from);
      if (pc)
        try {
          await pc.addIceCandidate(msg.candidate);
        } catch {
          /* stale candidate after close */
        }
    }
  }

  /* ---------- speaking detection ---------- */

  private watchSpeaking(id: string, stream: MediaStream) {
    if (!this.audioCtx || stream.getAudioTracks().length === 0) return;
    this.dropAnalyser(id);
    try {
      const source = this.audioCtx.createMediaStreamSource(stream);
      const analyser = this.audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      this.analysers.set(id, { analyser, source });
    } catch {
      /* stream without audio */
    }
  }

  private dropAnalyser(id: string) {
    const a = this.analysers.get(id);
    if (a) {
      a.source.disconnect();
      this.analysers.delete(id);
    }
  }

  private startSpeakTimer() {
    if (this.speakTimer) return;
    const buf = new Uint8Array(512);
    this.speakTimer = setInterval(() => {
      const speaking: Record<string, boolean> = {};
      for (const [id, { analyser }] of this.analysers) {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        speaking[id] = Math.sqrt(sum / buf.length) > 0.04;
      }
      const prev = useRooms.getState().speaking;
      const changed =
        Object.keys(speaking).length !== Object.keys(prev).length ||
        Object.entries(speaking).some(([k, v]) => prev[k] !== v);
      if (changed) useRooms.setState({ speaking });
    }, 180);
  }

  get id() {
    return this.selfId;
  }
}

export const engine = new RoomEngine();

/** Let auth wire the display name in without a hard dependency. */
export function setVoiceDisplayName(name: string | null | undefined) {
  if (typeof window !== "undefined") {
    (window as { __ffUserName?: string }).__ffUserName = name || undefined;
  }
}
