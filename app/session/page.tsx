"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Copy,
  Download,
  Eraser,
  LogIn,
  Mic,
  MicOff,
  MonitorUp,
  Pencil,
  PhoneOff,
  Plus,
  ScreenShare,
  ScreenShareOff,
  Trash2,
  UsersRound,
  Video,
  VideoOff,
} from "lucide-react";
import { BackgroundStage } from "@/components/bg/background-stage";
import { Dock } from "@/components/dock";
import { TopBar } from "@/components/top-bar";
import { useUser } from "@/lib/auth";
import { useRoom, type RemotePeer } from "@/lib/use-room";
import { generateRoomCode } from "@/lib/webrtc";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const COLORS = ["#ECECF2", "#86F7D0", "#78B7FF", "#FFB86B", "#FF8A8A", "#C7A3FF"];
type BoardMode = "pen" | "eraser";

export default function SessionPage() {
  // Next.js 15 requires useSearchParams to live inside a Suspense boundary
  // so that the prerender doesn't bail out the whole route into pure CSR.
  return (
    <Suspense fallback={<SessionLoading />}>
      <SessionRouter />
    </Suspense>
  );
}

function SessionRouter() {
  const searchParams = useSearchParams();
  const roomFromUrl = searchParams.get("room");

  // No room in URL → show lobby. Otherwise → show live room.
  if (!roomFromUrl) {
    return <Lobby />;
  }

  return <Room roomId={roomFromUrl.toUpperCase()} />;
}

function SessionLoading() {
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <BackgroundStage />
      <TopBar />
      <main className="relative z-[5] mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 pb-28 sm:px-7">
        <div className="text-sm text-text-dim">Loading session…</div>
      </main>
      <Dock />
    </div>
  );
}

/* ============================================================
   Lobby — create or join
   ============================================================ */

function Lobby() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");

  const createRoom = () => {
    const code = generateRoomCode();
    router.push(`/session?room=${code}`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) return;
    router.push(`/session?room=${code}`);
  };

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <BackgroundStage />
      <TopBar />

      <main className="relative z-[5] mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-28 sm:px-7">
        <header className="mb-8 mt-2">
          <p className="font-pixel text-[9px] uppercase tracking-[0.2em] desk-ink-dim">Live session</p>
          <h1 className="mt-2 text-balance font-pixel text-xl desk-ink sm:text-2xl">
            Study together in a private room.
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-text-dim">
            Real-time video and audio with whoever shares your room code. Peer-to-peer — no
            recording, no server in the middle of your call.
          </p>
        </header>

        {!isSupabaseConfigured && (
          <div className="mb-4 rounded-xl border border-[#FFCB6B]/[0.18] bg-[#FFCB6B]/[0.06] p-3 text-xs text-[#FFD88A]">
            Supabase isn't configured. Live sessions need it for signaling. Set up your env
            vars to enable rooms.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={createRoom}
            disabled={!isSupabaseConfigured}
            className="panel flex flex-col items-start gap-3 text-left transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[hsl(var(--accent)/0.16)] text-[var(--accent-deep)]">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Create a new room</h3>
              <p className="mt-1 text-xs text-text-dim">
                Generates a fresh code you can share with up to 4 friends.
              </p>
            </div>
          </button>

          <form onSubmit={joinRoom} className="panel flex flex-col gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[hsl(var(--accent-alt)/0.16)] text-[hsl(var(--accent-alt))]">
              <LogIn className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Join an existing room</h3>
              <p className="mt-1 text-xs text-text-dim">
                Enter the 6-character code your friend sent you.
              </p>
            </div>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="A1B2C3"
              maxLength={8}
              className="mt-1 w-full rounded-xl border border-black/25 bg-black/[0.05] px-4 py-3 text-center font-mono text-lg tracking-[0.3em] uppercase outline-none transition-colors placeholder:text-text-faint focus:border-black/40"
            />
            <button
              type="submit"
              disabled={joinCode.trim().length < 4 || !isSupabaseConfigured}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--title-grad)] px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              Join room
            </button>
          </form>
        </div>

        <p className="mt-6 text-xs text-text-faint">
          Tip: rooms are ephemeral. They exist only while someone is in them.
        </p>
      </main>

      <Dock />
    </div>
  );
}

/* ============================================================
   Room — active session with video + whiteboard
   ============================================================ */

function Room({ roomId }: { roomId: string }) {
  const router = useRouter();
  const user = useUser();
  const displayName = user?.name || user?.email?.split("@")[0] || "Guest";

  // Local media state
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [busy, setBusy] = useState("");
  const [mediaError, setMediaError] = useState("");
  const [acquiringMedia, setAcquiringMedia] = useState(true);

  // Whether the browser even supports screen share (desktop only)
  const canShareScreen =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === "function";

  /* ----------------------------------------------------------
     Request camera + mic ONCE on room entry.
     Tracks start disabled (you appear muted/camera-off) but the
     stream is already in the peer connection so the SDP offer
     includes the right m-lines. Toggling later just flips
     track.enabled — no renegotiation needed.
     ---------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        // Start muted + camera off — user explicitly turns each on.
        stream.getVideoTracks().forEach((t) => (t.enabled = false));
        stream.getAudioTracks().forEach((t) => (t.enabled = false));
        setLocalStream(stream);
      } catch (err) {
        if (!cancelled) {
          setMediaError(getMediaError(err));
          // Still join the room — they can see/hear others, just can't broadcast.
        }
      } finally {
        if (!cancelled) setAcquiringMedia(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // WebRTC + signaling — only start AFTER we've finished trying to get media.
  // This ensures the initial SDP offer includes our tracks.
  const { peers, connected, error: roomError } = useRoom(
    acquiringMedia ? null : roomId,
    localStream,
    displayName
  );

  /* Attach local stream to the preview video element */
  useEffect(() => {
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
      screenStream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Toggle handlers — just flip track.enabled ---------- */
  const toggleCamera = () => {
    if (!localStream) {
      setMediaError("Camera not available — refresh and grant permission.");
      return;
    }
    const next = !cameraOn;
    localStream.getVideoTracks().forEach((t) => (t.enabled = next));
    setCameraOn(next);
  };

  const toggleMic = () => {
    if (!localStream) {
      setMediaError("Microphone not available — refresh and grant permission.");
      return;
    }
    const next = !micOn;
    localStream.getAudioTracks().forEach((t) => (t.enabled = next));
    setMicOn(next);
  };

  const toggleScreen = async () => {
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      return;
    }
    setBusy("screen");
    setMediaError("");
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        setScreenStream(null);
      });
      setScreenStream(stream);
    } catch (err) {
      setMediaError(getMediaError(err));
    } finally {
      setBusy("");
    }
  };

  const leaveSession = () => {
    localStream?.getTracks().forEach((t) => t.stop());
    screenStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setScreenStream(null);
    router.push("/session");
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
    } catch {
      // older browsers — silently ignore
    }
  };

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <BackgroundStage />
      <TopBar />

      <main className="relative z-[5] mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-y-auto px-4 pb-28 sm:px-7">
        <header className="mb-5 mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 font-pixel text-[9px] uppercase tracking-[0.2em] desk-ink-dim">
              Live session
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide",
                  connected
                    ? "bg-[#7DE0B6]/[0.15] text-[#B6EFD3]"
                    : "bg-black/[0.05] text-text-dim"
                )}
              >
                {connected ? "Connected" : "Connecting…"}
              </span>
            </div>
            <h1 className="mt-2 flex items-center gap-3 text-balance font-pixel text-xl desk-ink sm:text-2xl">
              Room
              <button
                onClick={copyCode}
                title="Copy room code"
                className="inline-flex items-center gap-2 rounded-xl border border-black/25 bg-black/[0.05] px-3 py-1.5 font-mono text-xl tracking-[0.25em] text-[var(--accent-deep)] transition-colors hover:bg-black/[0.08]"
              >
                {roomId}
                <Copy className="h-4 w-4 text-text-dim" />
              </button>
            </h1>
            <p className="mt-1.5 text-xs text-text-dim">
              Share that code — anyone who enters it lands in this room.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <ControlButton
              active={cameraOn}
              disabled={busy === "camera"}
              icon={cameraOn ? Video : VideoOff}
              label={cameraOn ? "Camera on" : "Camera"}
              onClick={toggleCamera}
            />
            <ControlButton
              active={micOn}
              disabled={busy === "mic"}
              icon={micOn ? Mic : MicOff}
              label={micOn ? "Mic on" : "Mic"}
              onClick={toggleMic}
            />
            {canShareScreen && (
              <ControlButton
                active={!!screenStream}
                disabled={busy === "screen"}
                icon={screenStream ? ScreenShareOff : ScreenShare}
                label={screenStream ? "Stop share" : "Share"}
                onClick={toggleScreen}
              />
            )}
            <button
              onClick={leaveSession}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#FF8A8A]/25 bg-[#FF8A8A]/10 px-3 text-sm font-medium text-[#FFB0B0] transition-colors hover:bg-[#FF8A8A]/20"
            >
              <PhoneOff className="h-4 w-4" />
              Leave
            </button>
          </div>
        </header>

        {(mediaError || roomError) && (
          <div className="mb-4 rounded-xl border border-[#FF8A8A]/[0.18] bg-[#FF8A8A]/[0.06] p-3 text-xs text-[#FFA8A8]">
            {mediaError || roomError}
          </div>
        )}

        <div className="grid flex-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
          <section className="grid gap-4 lg:grid-rows-[minmax(320px,1fr)_220px]">
            {/* Stage — your screen share preview */}
            <div className="panel flex min-h-[360px] flex-col p-0">
              <div className="flex items-center justify-between border-b border-black/25 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MonitorUp className="h-4 w-4 text-[var(--accent-deep)]" />
                  Stage
                </div>
                <span className="rounded-full border border-black/25 px-2.5 py-1 text-[11px] text-text-dim">
                  {screenStream ? "You're sharing" : "Ready"}
                </span>
              </div>
              <div className="relative grid flex-1 place-items-center overflow-hidden rounded-b-2xl bg-black/25">
                {screenStream ? (
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full max-h-full w-full object-contain"
                  />
                ) : (
                  <div className="grid min-h-[280px] place-items-center text-center text-sm text-text-faint">
                    <div>
                      <ScreenShare className="mx-auto mb-3 h-8 w-8 opacity-60" />
                      <div>
                        {canShareScreen
                          ? "Click 'Share' to project your screen."
                          : "Screen sharing isn't supported in mobile browsers."}
                      </div>
                      {canShareScreen && (
                        <div className="mt-1 text-[11px]">
                          (Local preview only — sharing to peers comes in a future update.)
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Participant tiles row */}
            <div className="grid gap-4 sm:grid-cols-3">
              <ParticipantTile
                label="You"
                stream={localStream}
                cameraOn={cameraOn}
                micOn={micOn}
                isLocal
              />
              {peers.map((peer) => (
                <RemoteParticipantTile key={peer.id} peer={peer} />
              ))}
              {peers.length < 2 && (
                <div className="panel flex min-h-[160px] flex-col items-center justify-center gap-2 text-center text-xs text-text-faint">
                  <UsersRound className="h-6 w-6 opacity-50" />
                  <span>Waiting for someone to join…</span>
                  <span className="text-[10px]">Share code {roomId}</span>
                </div>
              )}
            </div>
          </section>

          <Whiteboard roomId={roomId} />
        </div>
      </main>

      <Dock />
    </div>
  );
}

/* ============================================================
   Small helper components
   ============================================================ */

function ControlButton({
  active,
  disabled,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors disabled:opacity-55",
        active
          ? "border-black/30 bg-[hsl(var(--accent)/0.15)] text-[var(--accent-deep)]"
          : "border-black/25 bg-black/[0.05] text-text-dim hover:bg-black/[0.08] hover:text-text"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function ParticipantTile({
  label,
  stream,
  cameraOn,
  micOn,
  isLocal = false,
}: {
  label: string;
  stream: MediaStream | null;
  cameraOn: boolean;
  micOn: boolean;
  isLocal?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="panel flex min-h-[160px] flex-col p-0">
      <div className="border-b border-black/25 px-4 py-3 text-sm font-semibold">
        {label}
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-b-2xl bg-black/30">
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal /* mute your OWN audio to avoid feedback */}
          playsInline
          className={cn("h-full w-full object-cover", !cameraOn && "hidden")}
        />
        {!cameraOn && (
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-black/[0.05] text-text-dim">
            <VideoOff className="h-6 w-6" />
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          <StatusPill active={micOn} label={micOn ? "Mic" : "Muted"} />
          <StatusPill active={cameraOn} label={cameraOn ? "Cam" : "Off"} />
        </div>
      </div>
    </div>
  );
}

function RemoteParticipantTile({ peer }: { peer: RemotePeer }) {
  // For remote peers we infer track status from the actual stream.
  const stream = peer.stream;
  const cameraOn =
    stream?.getVideoTracks().some((t) => t.enabled && t.readyState === "live") ?? false;
  const micOn =
    stream?.getAudioTracks().some((t) => t.enabled && t.readyState === "live") ?? false;

  return (
    <ParticipantTile
      label={peer.name}
      stream={stream}
      cameraOn={cameraOn}
      micOn={micOn}
    />
  );
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-wide ",
        active
          ? "border-black/30 bg-[hsl(var(--accent)/0.16)] text-[var(--accent-deep)]"
          : "border-black/25 bg-black/35 text-text-dim"
      )}
    >
      {label}
    </span>
  );
}

function getMediaError(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError")
      return "Permission was blocked — click the camera icon in the address bar to allow, then try again.";
    if (error.name === "NotFoundError")
      return "No camera or microphone was detected on this device.";
    if (error.name === "NotReadableError")
      return "Camera or mic is already in use by another app (Zoom, OBS, browser tab, etc.). Close it and try again.";
    if (error.name === "OverconstrainedError")
      return "Your camera doesn't support the requested settings.";
    if (error.name === "SecurityError")
      return "Browser blocked media access — this usually means an insecure (HTTP) connection. Use HTTPS.";
    return `Could not start device (${error.name}: ${error.message}).`;
  }
  if (error instanceof Error) return `Could not start device: ${error.message}`;
  return "Could not start the selected device.";
}

/* ============================================================
   Whiteboard — collaborative via Supabase Realtime broadcast.
   Strokes are sent as normalized 0..1 coordinates so they render
   identically across different canvas sizes (laptop vs phone).
   ============================================================ */

interface StrokeMessage {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  size: number;
  mode: BoardMode;
}

function Whiteboard({ roomId }: { roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [mode, setMode] = useState<BoardMode>("pen");
  const [color, setColor] = useState(COLORS[1]);
  const [size, setSize] = useState(4);

  // Broadcast helper — sends strokes to other peers in this room.
  const broadcastRef = useRef<((event: string, payload: any) => void) | null>(
    null
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      const snapshot = document.createElement("canvas");
      snapshot.width = canvas.width;
      snapshot.height = canvas.height;
      snapshot.getContext("2d")?.drawImage(canvas, 0, 0);

      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * scale));
      canvas.height = Math.max(1, Math.floor(rect.height * scale));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.fillStyle = "rgba(255,255,255,0.015)";
      ctx.fillRect(0, 0, rect.width, rect.height);
      if (snapshot.width > 1 && snapshot.height > 1) {
        ctx.drawImage(
          snapshot,
          0,
          0,
          snapshot.width / scale,
          snapshot.height / scale,
          0,
          0,
          rect.width,
          rect.height
        );
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  /* ----------------------------------------------------------
     Subscribe to a separate Supabase channel just for whiteboard
     strokes. Decoupled from the WebRTC video channel so they
     don't interfere with each other.
     ---------------------------------------------------------- */
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !roomId) return;
    const channel = supabase.channel(`whiteboard:${roomId}`, {
      config: { broadcast: { self: false } },
    });

    channel.on("broadcast", { event: "stroke" }, ({ payload }) => {
      drawStroke(payload as StrokeMessage, false);
    });
    channel.on("broadcast", { event: "clear" }, () => {
      clearLocal();
    });

    channel.subscribe();
    broadcastRef.current = (event, payload) => {
      void channel.send({ type: "broadcast", event, payload });
    };

    return () => {
      broadcastRef.current = null;
      void supabase!.removeChannel(channel);
    };
  }, [roomId]);

  /* drawStroke applies a stroke to the canvas. If `andBroadcast`
     is true, also pushes it to other peers. */
  const drawStroke = (msg: StrokeMessage, andBroadcast: boolean) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();

    // Strokes are stored as 0..1 normalized coords for cross-device consistency.
    const fx = msg.from.x * rect.width;
    const fy = msg.from.y * rect.height;
    const tx = msg.to.x * rect.width;
    const ty = msg.to.y * rect.height;

    ctx.save();
    ctx.globalCompositeOperation =
      msg.mode === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = msg.color;
    ctx.lineWidth = msg.mode === "eraser" ? msg.size * 4 : msg.size;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.restore();

    if (andBroadcast && broadcastRef.current) {
      broadcastRef.current("stroke", msg);
    }
  };

  const drawTo = (point: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    const previous = lastPointRef.current;
    if (!canvas || !previous) return;
    const rect = canvas.getBoundingClientRect();

    drawStroke(
      {
        from: { x: previous.x / rect.width, y: previous.y / rect.height },
        to: { x: point.x / rect.width, y: point.y / rect.height },
        color,
        size,
        mode,
      },
      true
    );
    lastPointRef.current = point;
  };

  const clearLocal = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "rgba(255,255,255,0.015)";
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const clearBoard = () => {
    clearLocal();
    broadcastRef.current?.("clear", {});
  };

  const downloadBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "focusflow-whiteboard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <section className="panel flex min-h-[560px] flex-col p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/25 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Pencil className="h-4 w-4 text-[var(--accent-deep)]" />
          Whiteboard
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-black/[0.05] p-1">
            <IconToggle
              active={mode === "pen"}
              label="Pen"
              icon={Pencil}
              onClick={() => setMode("pen")}
            />
            <IconToggle
              active={mode === "eraser"}
              label="Erase"
              icon={Eraser}
              onClick={() => setMode("eraser")}
            />
          </div>

          <div className="flex gap-1 rounded-lg bg-black/[0.05] p-1">
            {COLORS.map((swatch) => (
              <button
                key={swatch}
                onClick={() => {
                  setMode("pen");
                  setColor(swatch);
                }}
                className={cn(
                  "h-7 w-7 rounded-md border transition-transform hover:scale-105",
                  color === swatch && mode === "pen"
                    ? "border-white"
                    : "border-white/10"
                )}
                style={{ backgroundColor: swatch }}
                title={swatch}
              />
            ))}
          </div>

          <label className="flex h-9 items-center gap-2 rounded-lg bg-black/[0.05] px-2 text-xs text-text-dim">
            <span>{size}px</span>
            <input
              type="range"
              min="2"
              max="14"
              value={size}
              onChange={(event) => setSize(Number(event.target.value))}
              className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-black/[0.05] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[hsl(var(--accent))]"
            />
          </label>

          <button
            onClick={downloadBoard}
            className="grid h-9 w-9 place-items-center rounded-lg border border-black/25 bg-black/[0.05] text-text-dim transition-colors hover:bg-black/[0.08] hover:text-text"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={clearBoard}
            className="grid h-9 w-9 place-items-center rounded-lg border border-black/25 bg-black/[0.05] text-text-dim transition-colors hover:bg-black/[0.08] hover:text-text"
            title="Clear"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={wrapperRef}
        className="relative flex-1 overflow-hidden rounded-b-2xl bg-[rgba(8,8,13,0.72)]"
      >
        <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:32px_32px]" />
        <canvas
          ref={canvasRef}
          className="relative h-full w-full touch-none"
          onPointerDown={(event) => {
            const point = pointFromEvent(event);
            if (!point) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            drawingRef.current = true;
            lastPointRef.current = point;
          }}
          onPointerMove={(event) => {
            if (!drawingRef.current) return;
            const point = pointFromEvent(event);
            if (point) drawTo(point);
          }}
          onPointerUp={(event) => {
            event.currentTarget.releasePointerCapture(event.pointerId);
            drawingRef.current = false;
            lastPointRef.current = null;
          }}
          onPointerCancel={() => {
            drawingRef.current = false;
            lastPointRef.current = null;
          }}
        />
      </div>
    </section>
  );
}

function IconToggle({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors",
        active ? "bg-black/[0.05] text-text" : "text-text-dim hover:text-text"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
