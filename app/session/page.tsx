"use client";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  Eraser,
  Mic,
  MicOff,
  MonitorUp,
  Pencil,
  PhoneOff,
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
import { cn } from "@/lib/utils";

const COLORS = ["#ECECF2", "#86F7D0", "#78B7FF", "#FFB86B", "#FF8A8A", "#C7A3FF"];

type BoardMode = "pen" | "eraser";

export default function SessionPage() {
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [screenOn, setScreenOn] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      stopStream(cameraStreamRef.current);
      stopStream(screenStreamRef.current);
    };
  }, []);

  const attachCamera = (stream: MediaStream) => {
    cameraStreamRef.current = stream;
    if (cameraVideoRef.current) cameraVideoRef.current.srcObject = stream;
    setCameraOn(stream.getVideoTracks().some((track) => track.enabled));
    setMicOn(stream.getAudioTracks().some((track) => track.enabled));
  };

  const startCamera = async () => {
    setBusy("camera");
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      attachCamera(stream);
    } catch (err) {
      setError(getMediaError(err));
    } finally {
      setBusy("");
    }
  };

  const toggleCamera = async () => {
    const stream = cameraStreamRef.current;
    if (!stream) {
      await startCamera();
      return;
    }

    const next = !cameraOn;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
    setCameraOn(next);
  };

  const toggleMic = async () => {
    let stream = cameraStreamRef.current;
    if (!stream) {
      setBusy("mic");
      setError("");
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        attachCamera(stream);
      } catch (err) {
        setError(getMediaError(err));
        setBusy("");
        return;
      }
      setBusy("");
    }

    const next = !micOn;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
    setMicOn(next);
  };

  const toggleScreen = async () => {
    if (screenStreamRef.current) {
      stopScreen();
      return;
    }

    setBusy("screen");
    setError("");
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      screenStreamRef.current = stream;
      if (screenVideoRef.current) screenVideoRef.current.srcObject = stream;
      stream.getVideoTracks()[0]?.addEventListener("ended", stopScreen, { once: true });
      setScreenOn(true);
    } catch (err) {
      setError(getMediaError(err));
    } finally {
      setBusy("");
    }
  };

  const stopScreen = () => {
    stopStream(screenStreamRef.current);
    screenStreamRef.current = null;
    if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
    setScreenOn(false);
  };

  const leaveSession = () => {
    stopStream(cameraStreamRef.current);
    stopStream(screenStreamRef.current);
    cameraStreamRef.current = null;
    screenStreamRef.current = null;
    if (cameraVideoRef.current) cameraVideoRef.current.srcObject = null;
    if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
    setCameraOn(false);
    setMicOn(false);
    setScreenOn(false);
  };

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <BackgroundStage />
      <TopBar />

      <main className="relative z-[5] mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-y-auto px-4 pb-28 sm:px-7">
        <header className="mb-5 mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-dim">Live session</p>
            <h1 className="mt-2 text-balance text-3xl font-light tracking-tight">
              Study call with video, screen share, and whiteboard.
            </h1>
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
            <ControlButton
              active={screenOn}
              disabled={busy === "screen"}
              icon={screenOn ? ScreenShareOff : ScreenShare}
              label={screenOn ? "Stop share" : "Share"}
              onClick={toggleScreen}
            />
            <button
              onClick={leaveSession}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#FF8A8A]/25 bg-[#FF8A8A]/10 px-3 text-sm font-medium text-[#FFB0B0] transition-colors hover:bg-[#FF8A8A]/20"
            >
              <PhoneOff className="h-4 w-4" />
              Leave
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-xl border border-[#FF8A8A]/[0.18] bg-[#FF8A8A]/[0.06] p-3 text-xs text-[#FFA8A8]">
            {error}
          </div>
        )}

        <div className="grid flex-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
          <section className="grid gap-4 lg:grid-rows-[minmax(320px,1fr)_180px]">
            <div className="panel flex min-h-[360px] flex-col p-0">
              <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MonitorUp className="h-4 w-4 text-[hsl(var(--accent))]" />
                  Stage
                </div>
                <span className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[11px] text-text-dim">
                  {screenOn ? "Sharing" : "Ready"}
                </span>
              </div>

              <div className="relative grid flex-1 place-items-center overflow-hidden rounded-b-2xl bg-black/25">
                {screenOn ? (
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
                      <div>Screen share appears here.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[240px_1fr]">
              <div className="panel flex min-h-[160px] flex-col p-0">
                <div className="border-b border-white/[0.08] px-4 py-3 text-sm font-semibold">You</div>
                <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-b-2xl bg-black/30">
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={cn("h-full w-full object-cover", !cameraOn && "hidden")}
                  />
                  {!cameraOn && (
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.06] text-text-dim">
                      <VideoOff className="h-6 w-6" />
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 flex gap-1.5">
                    <StatusPill active={micOn} label={micOn ? "Mic" : "Muted"} />
                    <StatusPill active={cameraOn} label={cameraOn ? "Cam" : "Off"} />
                  </div>
                </div>
              </div>

              <div className="panel min-h-[160px]">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <UsersRound className="h-4 w-4 text-[hsl(var(--accent))]" />
                  Participants
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Participant name="You" status={cameraOn || micOn ? "Connected" : "Idle"} />
                  <Participant name="Guest slot" status="Waiting" muted />
                </div>
              </div>
            </div>
          </section>

          <Whiteboard />
        </div>
      </main>

      <Dock />
    </div>
  );
}

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
          ? "border-[hsl(var(--accent)/0.35)] bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]"
          : "border-white/[0.1] bg-white/[0.04] text-text-dim hover:bg-white/[0.08] hover:text-text"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-wide backdrop-blur-md",
        active
          ? "border-[hsl(var(--accent)/0.28)] bg-[hsl(var(--accent)/0.16)] text-[hsl(var(--accent))]"
          : "border-white/[0.1] bg-black/35 text-text-dim"
      )}
    >
      {label}
    </span>
  );
}

function Participant({ name, status, muted }: { name: string; status: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-[hsl(var(--accent)/0.14)] text-xs font-semibold text-[hsl(var(--accent))]">
        {name.slice(0, 1)}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{name}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-text-dim">
          {muted && <MicOff className="h-3 w-3" />}
          {status}
        </div>
      </div>
    </div>
  );
}

function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [mode, setMode] = useState<BoardMode>("pen");
  const [color, setColor] = useState(COLORS[1]);
  const [size, setSize] = useState(4);

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
        ctx.drawImage(snapshot, 0, 0, snapshot.width / scale, snapshot.height / scale, 0, 0, rect.width, rect.height);
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
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const drawTo = (point: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    const previous = lastPointRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !previous) return;

    ctx.save();
    ctx.globalCompositeOperation = mode === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = color;
    ctx.lineWidth = mode === "eraser" ? size * 4 : size;
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.restore();
    lastPointRef.current = point;
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "rgba(255,255,255,0.015)";
    ctx.fillRect(0, 0, rect.width, rect.height);
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Pencil className="h-4 w-4 text-[hsl(var(--accent))]" />
          Whiteboard
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-white/[0.05] p-1">
            <IconToggle active={mode === "pen"} label="Pen" icon={Pencil} onClick={() => setMode("pen")} />
            <IconToggle active={mode === "eraser"} label="Erase" icon={Eraser} onClick={() => setMode("eraser")} />
          </div>

          <div className="flex gap-1 rounded-lg bg-white/[0.05] p-1">
            {COLORS.map((swatch) => (
              <button
                key={swatch}
                onClick={() => {
                  setMode("pen");
                  setColor(swatch);
                }}
                className={cn(
                  "h-7 w-7 rounded-md border transition-transform hover:scale-105",
                  color === swatch && mode === "pen" ? "border-white" : "border-white/10"
                )}
                style={{ backgroundColor: swatch }}
                title={swatch}
              />
            ))}
          </div>

          <label className="flex h-9 items-center gap-2 rounded-lg bg-white/[0.05] px-2 text-xs text-text-dim">
            <span>{size}px</span>
            <input
              type="range"
              min="2"
              max="14"
              value={size}
              onChange={(event) => setSize(Number(event.target.value))}
              className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/[0.12] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[hsl(var(--accent))]"
            />
          </label>

          <button
            onClick={downloadBoard}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.1] bg-white/[0.04] text-text-dim transition-colors hover:bg-white/[0.08] hover:text-text"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={clearBoard}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.1] bg-white/[0.04] text-text-dim transition-colors hover:bg-white/[0.08] hover:text-text"
            title="Clear"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={wrapperRef} className="relative flex-1 overflow-hidden rounded-b-2xl bg-[rgba(8,8,13,0.72)]">
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
        active ? "bg-white/[0.12] text-text" : "text-text-dim hover:text-text"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function getMediaError(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") return "Permission was blocked for this device.";
    if (error.name === "NotFoundError") return "No matching camera, microphone, or display source was found.";
  }
  return "Could not start the selected device.";
}
