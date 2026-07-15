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
import { Window } from "@/components/retro/window";

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

  const remaining = tasks.filter((t) => !t.done).length;

  return (
    <Window
      title="TASKS.SYS"
      draggable
      className="min-h-0 flex-1"
      bodyClassName="flex min-h-0 flex-col"
      statusBar={
        <>
          <span className="status-cell flex-1">
            {tasks.length} object(s)
          </span>
          <span className="status-cell">{remaining} pending</span>
        </>
      }
    >
      <div className="mb-2 flex gap-1.5">
        <div className="well flex flex-1 items-center px-2 py-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            maxLength={80}
            placeholder="new task…"
            className="w-full bg-transparent text-[12px] outline-none placeholder:text-text-faint"
          />
        </div>

        <button onClick={submit} className="btn95 h-auto px-2.5" aria-label="Add task">
          <Plus className="h-3.5 w-3.5" strokeWidth={3} />
        </button>
      </div>

      <div className="well flex flex-1 flex-col gap-[2px] overflow-y-auto p-1">
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
          <div className="py-8 text-center font-digits text-sm text-text-faint">
            C:\TASKS&gt; dir
            <br />
            File not found. Add one above.
          </div>
        )}
      </div>
    </Window>
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
    high: "bg-[#9e2a1e] text-white",
    med: "bg-[#b07a1e] text-white",
    low: "bg-[#1e5f7d] text-white",
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
        "group flex cursor-grab items-center gap-2 px-1.5 py-1.5 hover:bg-[var(--accent-deep)] hover:text-white active:cursor-grabbing",
        task.done && "opacity-60"
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          "bevel-in grid h-[15px] w-[15px] flex-shrink-0 place-items-center bg-white"
        )}
        aria-label={task.done ? "Mark incomplete" : "Mark complete"}
      >
        {task.done && (
          <Check className="h-3 w-3 text-black" strokeWidth={4} />
        )}
      </button>

      <span
        className={cn(
          "flex-1 truncate text-[12px]",
          task.done && "line-through opacity-70"
        )}
      >
        {task.text}
      </span>

      <span
        className={cn(
          "px-1.5 py-0.5 font-pixel text-[8px] uppercase",
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
        className="grid h-5 w-5 place-items-center opacity-0 group-hover:opacity-100"
        aria-label="Delete task"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </motion.div>
  );
}