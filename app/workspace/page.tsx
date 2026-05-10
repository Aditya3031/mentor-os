"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Loader2, Plus, UsersRound } from "lucide-react";
import { BackgroundStage } from "@/components/bg/background-stage";
import { Dock } from "@/components/dock";
import { TopBar } from "@/components/top-bar";
import { useUser } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Workspace = {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
};

type WorkspaceTask = {
  id: string;
  workspace_id: string;
  text: string;
  done: boolean;
  created_at: string;
};

function inviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function WorkspacePage() {
  const user = useUser();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState("");
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [taskText, setTaskText] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const activeWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === activeId),
    [activeId, workspaces]
  );

  const loadWorkspaces = async () => {
    if (!supabase || !user?.id) return;

    const { data: memberships, error: membershipError } = await supabase
      .from("collab_workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id);

    if (membershipError) {
      setError(membershipError.message);
      return;
    }

    const ids = memberships?.map((m) => m.workspace_id) ?? [];
    if (ids.length === 0) {
      setWorkspaces([]);
      setActiveId("");
      return;
    }

    const { data, error: workspaceError } = await supabase
      .from("collab_workspaces")
      .select("id,name,invite_code,owner_id")
      .in("id", ids)
      .order("created_at", { ascending: false });

    if (workspaceError) {
      setError(workspaceError.message);
      return;
    }

    setWorkspaces(data ?? []);
    setActiveId((current) => current || data?.[0]?.id || "");
  };

  const loadTasks = async (workspaceId: string) => {
    if (!supabase || !workspaceId) return;

    const { data, error: taskError } = await supabase
      .from("collab_workspace_tasks")
      .select("id,workspace_id,text,done,created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (taskError) {
      setError(taskError.message);
      return;
    }

    setTasks(data ?? []);
  };

  useEffect(() => {
    void loadWorkspaces();
  }, [user?.id]);

  useEffect(() => {
    setTasks([]);
    if (activeId) void loadTasks(activeId);
  }, [activeId]);

  useEffect(() => {
    if (!supabase || !activeId) return;
    const client = supabase;

    const channel = client
      .channel(`workspace-tasks:${activeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "collab_workspace_tasks",
          filter: `workspace_id=eq.${activeId}`,
        },
        () => void loadTasks(activeId)
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [activeId]);

  const createWorkspace = async () => {
    if (!supabase || !user?.id || !workspaceName.trim()) return;
    setBusy("create");
    setError("");

    const { data, error: createError } = await supabase.rpc("create_collab_workspace", {
      workspace_name: workspaceName.trim(),
      code: inviteCode(),
    });

    if (createError) {
      setError(createError.message);
      setBusy("");
      return;
    }

    setWorkspaceName("");
    setBusy("");
    await loadWorkspaces();
    if (data?.id) setActiveId(data.id);
  };

  const joinWorkspace = async () => {
    if (!supabase || !joinCode.trim()) return;
    setBusy("join");
    setError("");

    const { data, error: joinError } = await supabase.rpc("join_workspace_by_invite", {
      code: joinCode.trim(),
    });

    if (joinError) {
      setError(joinError.message);
      setBusy("");
      return;
    }

    setJoinCode("");
    setBusy("");
    await loadWorkspaces();
    if (typeof data === "string") setActiveId(data);
  };

  const addTask = async () => {
    if (!supabase || !user?.id || !activeId || !taskText.trim()) return;
    setBusy("task");
    setError("");

    const { error: taskError } = await supabase.from("collab_workspace_tasks").insert({
      workspace_id: activeId,
      author_id: user.id,
      text: taskText.trim(),
    });

    if (taskError) setError(taskError.message);

    setTaskText("");
    setBusy("");
    await loadTasks(activeId);
  };

  const toggleTask = async (task: WorkspaceTask) => {
    if (!supabase) return;
    await supabase.from("collab_workspace_tasks").update({ done: !task.done }).eq("id", task.id);
    await loadTasks(task.workspace_id);
  };

  const copyInvite = async () => {
    if (!activeWorkspace) return;
    await navigator.clipboard.writeText(activeWorkspace.invite_code);
  };

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <BackgroundStage />
      <TopBar />

      <main className="relative z-[5] mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-4 pb-28 sm:px-7">
        <header className="mb-8 mt-2">
          <p className="text-xs uppercase tracking-[0.2em] text-text-dim">Collaborative workspace</p>
          <h1 className="mt-2 text-balance text-3xl font-light tracking-tight">
            Shared focus rooms for people working together.
          </h1>
        </header>

        {!isSupabaseConfigured && (
          <div className="panel text-sm text-text-dim">
            Add Supabase env vars first, then run the collaboration SQL file.
          </div>
        )}

        {isSupabaseConfigured && !user && (
          <div className="panel text-sm text-text-dim">
            Sign in to create or join a collaborative workspace.
          </div>
        )}

        {isSupabaseConfigured && user && (
          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <aside className="space-y-4">
              <section className="panel">
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--accent)/0.16)] text-[hsl(var(--accent))]">
                    <UsersRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Create room</h2>
                    <p className="text-xs text-text-dim">Start a shared workspace.</p>
                  </div>
                </div>
                <input
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Study group name"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-text-faint"
                />
                <button
                  onClick={createWorkspace}
                  disabled={busy === "create" || !workspaceName.trim()}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] px-4 py-3 text-sm font-semibold text-bg-0 disabled:opacity-55"
                >
                  {busy === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create
                </button>
              </section>

              <section className="panel">
                <h2 className="mb-3 text-sm font-semibold">Join with code</h2>
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm uppercase outline-none placeholder:text-text-faint"
                />
                <button
                  onClick={joinWorkspace}
                  disabled={busy === "join" || !joinCode.trim()}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.12] px-4 py-3 text-sm font-semibold text-text disabled:opacity-55"
                >
                  {busy === "join" && <Loader2 className="h-4 w-4 animate-spin" />}
                  Join room
                </button>
              </section>
            </aside>

            <section className="panel min-h-[520px]">
              {error && (
                <div className="mb-4 rounded-xl border border-[#FF8A8A]/[0.18] bg-[#FF8A8A]/[0.06] p-3 text-xs text-[#FFA8A8]">
                  {error}
                </div>
              )}

              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => setActiveId(workspace.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs transition-colors",
                        activeId === workspace.id
                          ? "border-[hsl(var(--accent)/0.45)] bg-[hsl(var(--accent)/0.14)] text-[hsl(var(--accent))]"
                          : "border-white/[0.1] text-text-dim hover:text-text"
                      )}
                    >
                      {workspace.name}
                    </button>
                  ))}
                </div>

                {activeWorkspace && (
                  <button
                    onClick={copyInvite}
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] px-3 py-1.5 text-xs text-text-dim hover:text-text"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {activeWorkspace.invite_code}
                  </button>
                )}
              </div>

              {!activeWorkspace ? (
                <div className="grid min-h-[360px] place-items-center text-center text-sm text-text-faint">
                  Create or join a room to start collaborating.
                </div>
              ) : (
                <>
                  <div className="mb-4 flex gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5">
                    <input
                      value={taskText}
                      onChange={(e) => setTaskText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTask()}
                      placeholder="Add a shared task..."
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-faint"
                    />
                    <button
                      onClick={addTask}
                      disabled={busy === "task" || !taskText.trim()}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] text-bg-0 disabled:opacity-55"
                    >
                      {busy === "task" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(task)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-sm transition-colors hover:bg-white/[0.06]",
                          task.done && "opacity-55"
                        )}
                      >
                        <span className={cn(task.done && "line-through")}>{task.text}</span>
                        <span className="text-xs text-text-faint">{task.done ? "done" : "open"}</span>
                      </button>
                    ))}

                    {tasks.length === 0 && (
                      <div className="py-10 text-center text-sm text-text-faint">
                        No shared tasks yet.
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </main>

      <Dock />
    </div>
  );
}
