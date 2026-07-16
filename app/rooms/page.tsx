"use client";

import { useEffect } from "react";
import { BackgroundStage } from "@/components/bg/background-stage";
import { TopBar } from "@/components/top-bar";
import { Taskbar } from "@/components/retro/taskbar";
import { Window, Desktop } from "@/components/retro/window";
import {
  STUDY_ROOMS,
  getRoom,
  useRooms,
  engine,
  setVoiceDisplayName,
  type RoomMember,
} from "@/lib/voice";
import { useUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
  PhoneCall,
  PhoneOff,
  LogOut,
  Timer,
} from "lucide-react";

/**
 * Study rooms — join a room to study alongside others: live presence
 * (who's here, what they're working on, whose timer is running) plus
 * optional Discord-style voice with mute / deafen / speaking rings.
 */
export default function RoomsPage() {
  const user = useUser();
  const roomId = useRooms((s) => s.roomId);

  // Give presence a real name once auth resolves; watch occupancy.
  useEffect(() => {
    setVoiceDisplayName(user?.name ?? user?.email ?? null);
    void engine.watchLobby();
  }, [user]);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <BackgroundStage />
      <TopBar />

      <main className="relative z-[5] min-h-0 flex-1 overflow-y-auto px-3 pb-16 pt-3 sm:px-7">
        <Desktop className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <RoomDirectory />
          {roomId ? <RoomView roomId={roomId} /> : <RoomsWelcome />}
        </Desktop>
      </main>

      <Taskbar />
    </div>
  );
}

/* ============================================================
   Directory — every room with live occupancy
   ============================================================ */

function RoomDirectory() {
  const lobby = useRooms((s) => s.lobby);
  const roomId = useRooms((s) => s.roomId);
  const joinRoom = useRooms((s) => s.joinRoom);
  const leaveRoom = useRooms((s) => s.leaveRoom);

  return (
    <Window
      title="ROOMS.NET"
      statusBar={
        <>
          <span className="status-cell">{STUDY_ROOMS.length} rooms</span>
          <span className="status-cell flex-1">
            {isSupabaseConfigured
              ? "network rooms"
              : "LAN mode — this device only (no backend configured)"}
          </span>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        {STUDY_ROOMS.map((room) => {
          const names = lobby[room.id] ?? [];
          const joined = roomId === room.id;
          return (
            <div
              key={room.id}
              className={cn(
                "bevel-thin flex items-center gap-3 px-3 py-2.5",
                joined && "bevel-in bg-[var(--paper)]"
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className={cn("font-pixel text-[11px]", joined && "text-[var(--accent-deep)]")}>
                    {room.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-text-faint">
                    {room.rule}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-[11px] text-text-dim">{room.motto}</div>
                {names.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {names.slice(0, 6).map((n, i) => (
                      <span
                        key={`${n}-${i}`}
                        className="bevel-thin px-1.5 py-0.5 text-[10px] text-text-dim"
                        title={n}
                      >
                        {n.split(" ")[0].slice(0, 10)}
                      </span>
                    ))}
                    {names.length > 6 && (
                      <span className="text-[10px] text-text-faint">+{names.length - 6}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-digits text-lg leading-none text-[var(--accent-deep)]">
                  {names.length}
                </span>
                <button
                  className={cn("btn95 h-7 px-2.5 text-[9px]", joined && "btn95-primary")}
                  onClick={() => (joined ? leaveRoom() : void joinRoom(room.id))}
                >
                  {joined ? "Leave" : "Enter"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Window>
  );
}

function RoomsWelcome() {
  return (
    <Window title="README.TXT" bodyClassName="p-4">
      <p className="font-pixel text-[11px] uppercase tracking-wider text-[var(--accent-deep)]">
        Study together
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-text-dim">
        Pick a room on the left. Everyone inside can see your name, what
        you&apos;re studying and whether your timer is running — quiet
        accountability, like sharing a library table.
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-text-dim">
        Rooms marked <b className="text-text">voice ok</b> have optional
        voice chat: join with your mic, or listen-only if you&apos;d rather
        keep quiet. Mute and deafen work like you&apos;d expect from
        Discord.
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-text-dim">
        You stay in the room while using the rest of the app — the tray
        shows a door icon while you&apos;re inside.
      </p>
    </Window>
  );
}

/* ============================================================
   Room view — members + voice controls
   ============================================================ */

function RoomView({ roomId }: { roomId: string }) {
  const room = getRoom(roomId);
  const members = useRooms((s) => s.members);
  const transport = useRooms((s) => s.transport);
  const voiceStatus = useRooms((s) => s.voiceStatus);

  const inVoiceCount = members.filter((m) => m.inVoice).length;

  return (
    <Window
      title="ROOM.NET"
      titleExtra={
        <span className="hidden items-center gap-1 text-[9px] opacity-80 sm:flex">
          {room?.name}
        </span>
      }
      statusBar={
        <>
          <span className="status-cell">{members.length} studying</span>
          <span className="status-cell">{inVoiceCount} in voice</span>
          <span className="status-cell flex-1">
            {transport === "lan" ? "LAN" : "NET"} · {room?.rule}
          </span>
        </>
      }
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <div>
            <span className="font-pixel text-[12px] text-[var(--accent-deep)]">
              {room?.name ?? roomId}
            </span>
            <span className="ml-2 text-[11px] text-text-dim">{room?.motto}</span>
          </div>
        </div>

        <div className="well min-h-0 flex-1 overflow-y-auto p-1.5">
          {members.length === 0 && (
            <div className="px-2 py-6 text-center text-[12px] text-text-faint">
              Connecting to the room…
            </div>
          )}
          {members.map((m) => (
            <MemberRow key={m.id} member={m} />
          ))}
        </div>

        <VoiceControls />
      </div>
      {voiceStatus === "error" && <VoiceError />}
    </Window>
  );
}

function MemberRow({ member }: { member: RoomMember }) {
  const speakingMap = useRooms((s) => s.speaking);
  const selfId = engine.id;
  const isSelf = member.id === selfId;
  const speaking = isSelf ? speakingMap["self"] : speakingMap[member.id];

  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5">
      <span
        className={cn(
          "grid h-7 w-7 flex-shrink-0 place-items-center bg-[var(--title-grad)] font-pixel text-[10px] text-white",
          member.inVoice && speaking && "ring-2 ring-[#3aff9e]"
        )}
        aria-hidden
      >
        {(member.name || "?").charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className={cn("truncate", isSelf && "font-bold")}>
            {member.name}
            {isSelf && " (you)"}
          </span>
          {member.inVoice &&
            (member.muted ? (
              <MicOff className="h-3 w-3 flex-shrink-0 text-text-faint" aria-label="muted" />
            ) : (
              <Mic className="h-3 w-3 flex-shrink-0 text-[var(--accent-deep)]" aria-label="in voice" />
            ))}
        </div>
        <div className="truncate text-[11px] text-text-faint">
          {member.subject ? `studying ${member.subject}` : "just here"}
        </div>
      </div>
      {member.running && (
        <span
          className="status-cell flex items-center gap-1 text-[10px]"
          title={`${member.mode} session running`}
        >
          <Timer className="h-3 w-3" />
          {member.mode}
        </span>
      )}
    </div>
  );
}

function VoiceControls() {
  const voiceStatus = useRooms((s) => s.voiceStatus);
  const selfMuted = useRooms((s) => s.selfMuted);
  const deafened = useRooms((s) => s.deafened);
  const listenOnly = useRooms((s) => s.listenOnly);
  const joinVoice = useRooms((s) => s.joinVoice);
  const leaveVoice = useRooms((s) => s.leaveVoice);
  const toggleMute = useRooms((s) => s.toggleMute);
  const toggleDeafen = useRooms((s) => s.toggleDeafen);
  const leaveRoom = useRooms((s) => s.leaveRoom);

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {voiceStatus === "off" || voiceStatus === "error" ? (
        <button className="btn95 btn95-primary h-8 gap-1.5 px-3 text-[10px]" onClick={() => void joinVoice()}>
          <PhoneCall className="h-3.5 w-3.5" />
          Join voice
        </button>
      ) : (
        <>
          <button
            className={cn("btn95 h-8 gap-1.5 px-3 text-[10px]", selfMuted && "bevel-in")}
            onClick={toggleMute}
            disabled={listenOnly}
            title={listenOnly ? "No microphone — listen-only" : selfMuted ? "Unmute" : "Mute"}
          >
            {selfMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            {selfMuted ? "Muted" : "Mute"}
          </button>
          <button
            className={cn("btn95 h-8 gap-1.5 px-3 text-[10px]", deafened && "bevel-in")}
            onClick={toggleDeafen}
            title={deafened ? "Undeafen" : "Deafen (mutes everyone incl. your mic)"}
          >
            {deafened ? <HeadphoneOff className="h-3.5 w-3.5" /> : <Headphones className="h-3.5 w-3.5" />}
            {deafened ? "Deafened" : "Deafen"}
          </button>
          <button className="btn95 h-8 gap-1.5 px-3 text-[10px]" onClick={leaveVoice}>
            <PhoneOff className="h-3.5 w-3.5" />
            {voiceStatus === "connecting" ? "Connecting…" : "Leave voice"}
          </button>
          {listenOnly && (
            <span className="text-[10px] text-text-faint">listen-only (no mic found)</span>
          )}
        </>
      )}
      <span className="flex-1" />
      <button className="btn95 h-8 gap-1.5 px-3 text-[10px]" onClick={leaveRoom}>
        <LogOut className="h-3.5 w-3.5" />
        Leave room
      </button>
    </div>
  );
}

function VoiceError() {
  const voiceError = useRooms((s) => s.voiceError);
  return (
    <div className="mx-2.5 mb-2.5 bevel-thin px-3 py-2 text-[11px] text-[#9e2a1e]">
      Voice failed: {voiceError ?? "unknown error"}. Check mic permissions and try again.
    </div>
  );
}
