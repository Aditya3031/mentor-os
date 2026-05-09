"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import type { Task } from "@/lib/store";

export function TasksPanel() {
  const tasks = useStore((s) => s.tasks);

  const addTask = useStore((s) => s.addTask);

  const toggleTask = useStore((s) => s.toggleTask);

  // The store action is called `removeTask`, not `deleteTask`.
  const removeTask = useStore((s) => s.removeTask);

  const reorderTasks = useStore((s) => s.reorderTasks);

  const [draft, setDraft] = useState("");

  // dnd-kit assigns aria IDs that differ between server and client renders.
  // Mounting the DndContext only after hydration prevents the mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })
  );

  const submit = () => {
    if (!draft.trim()) return;

    addTask(draft);

    setDraft("");
  };

  return (
    <div className="panel flex min-h-0 flex-1 flex-col">
      <div className="panel-h">
        <h3>Tasks</h3>

        <span className="font-mono text-xs text-text-dim">
          ⌘N
        </span>
      </div>

      <div className="mb-3 flex gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 transition-colors focus-within:border-white/[0.14]">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          maxLength={80}
          placeholder="Add a focus task…"
          className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-text-faint"
        />

        <button
          onClick={submit}
          className="grid h-7 w-7 place-items-center rounded-lg bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] text-bg-0 transition-transform hover:scale-105"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={3} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
        {mounted && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => {
              const { active, over } = e;

              if (over && active.id !== over.id) {
                const oldIndex = tasks.findIndex(
                  (t) => t.id === active.id
                );

                const newIndex = tasks.findIndex(
                  (t) => t.id === over.id
                );

                const next = arrayMove(
                  tasks,
                  oldIndex,
                  newIndex
                );

                reorderTasks(
                  next.map((t) => t.id)
                );
              }
            }}
          >
            <SortableContext
              items={tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence>
                {tasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    onToggle={() => toggleTask(t.id)}
                    onDelete={() => removeTask(t.id)}
                  />
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        )}

        {tasks.length === 0 && (
          <div className="py-8 text-center text-xs text-text-faint">
            No tasks yet. Add one to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const priColors: Record<Task["priority"], string> = {
    high: "bg-[#FFB8A2]/12 text-[#FFB8A2]",
    med: "bg-[#FFCB6B]/12 text-[#FFCB6B]",
    low: "bg-[#7CC6FF]/12 text-[#7CC6FF]",
  };

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{
        opacity: isDragging ? 0.4 : 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        x: -8,
        transition: {
          duration: 0.18,
        },
      }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      className={cn(
        "group flex cursor-grab items-center gap-2.5 rounded-xl border border-transparent p-2.5 transition-all hover:border-white/[0.08] hover:bg-white/[0.03] active:cursor-grabbing",
        task.done && "opacity-60"
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          "grid h-[18px] w-[18px] flex-shrink-0 place-items-center rounded-md border-[1.5px] border-white/[0.14] transition-all",
          task.done &&
            "border-transparent bg-[linear-gradient(135deg,#7DE0B6,#B6EFD3)]"
        )}
      >
        {task.done && (
          <Check
            className="h-3 w-3 text-bg-0"
            strokeWidth={3}
          />
        )}
      </button>

      <span
        className={cn(
          "flex-1 text-[13px]",
          task.done &&
            "text-text-faint line-through"
        )}
      >
        {task.text}
      </span>

      <span
        className={cn(
          "rounded-md px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
          priColors[task.priority]
        )}
      >
        {task.priority}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();

          onDelete();
        }}
        className="grid h-6 w-6 place-items-center rounded-md text-text-faint opacity-0 transition-all hover:bg-[#FF8A8A]/10 hover:text-[#FF8A8A] group-hover:opacity-100"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </motion.div>
  );
}