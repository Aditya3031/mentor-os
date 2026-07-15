"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Desktop = drag bounds + z-order registry for retro windows.
 * Wrap a page region in <Desktop> and every <Window draggable>
 * inside can be dragged within it and raised on click.
 */
const DesktopCtx = createContext<{
  boundsRef: React.RefObject<HTMLDivElement | null> | null;
  raise: () => number;
}>({ boundsRef: null, raise: () => 1 });

export function Desktop({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const boundsRef = useRef<HTMLDivElement>(null);
  const zCounter = useRef(10);
  const raise = useCallback(() => ++zCounter.current, []);

  return (
    <DesktopCtx.Provider value={{ boundsRef, raise }}>
      <div ref={boundsRef} className={cn("relative", className)}>
        {children}
      </div>
    </DesktopCtx.Provider>
  );
}

interface WindowProps {
  title: string;
  /** Small glyph rendered before the title (e.g. a 12px lucide icon) */
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Enable drag-by-title-bar (only within a <Desktop>) */
  draggable?: boolean;
  /** ✕ handler. Without it, ✕ shades the window like — does. */
  onClose?: () => void;
  /** Extra content pinned to the right side of the title bar */
  titleExtra?: React.ReactNode;
  /** Render the classic sunken status strip below the body */
  statusBar?: React.ReactNode;
  /** Skip rendering the — □ ✕ button cluster */
  noControls?: boolean;
}

/**
 * A retro OS window: gradient title bar, beveled chrome, optional
 * drag-by-title-bar and shade-collapse. Replaces the old glass `.panel`.
 */
export function Window({
  title,
  icon,
  children,
  className,
  bodyClassName,
  draggable = false,
  onClose,
  titleExtra,
  statusBar,
  noControls = false,
}: WindowProps) {
  const { boundsRef, raise } = useContext(DesktopCtx);
  const [shaded, setShaded] = useState(false);
  const [z, setZ] = useState<number | undefined>(undefined);
  const dragControls = useDragControls();

  // Dragging is a desktop luxury — phones need their touch for scrolling.
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const canDrag = draggable && !!boundsRef && wide;

  return (
    <motion.div
      drag={canDrag}
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={canDrag ? boundsRef! : undefined}
      dragElastic={0}
      dragMomentum={false}
      onPointerDown={() => setZ(raise())}
      style={z !== undefined ? { zIndex: z } : undefined}
      className={cn("win95 flex flex-col p-[3px]", className)}
    >
      <div
        className={cn(
          "title-bar justify-between",
          canDrag && "cursor-move touch-none"
        )}
        onPointerDown={(e) => {
          if (!canDrag) return;
          if ((e.target as HTMLElement).closest("button")) return;
          dragControls.start(e);
        }}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {icon && (
            <span className="flex-shrink-0 [&>svg]:h-3 [&>svg]:w-3">
              {icon}
            </span>
          )}
          <span className="truncate">{title}</span>
        </span>
        <span className="flex items-center gap-1">
          {titleExtra}
          {!noControls && (
            <span className="ml-1 flex gap-[2px]">
              <button
                className="tb-btn"
                aria-label={shaded ? "Restore" : "Minimize"}
                onClick={() => setShaded((s) => !s)}
              >
                <span className="mt-[7px] block h-[2px] w-[8px] bg-current" />
              </button>
              <button className="tb-btn" aria-label="Maximize">
                <span className="block h-[9px] w-[9px] border border-current border-t-2" />
              </button>
              <button
                className="tb-btn"
                aria-label="Close"
                onClick={onClose ?? (() => setShaded((s) => !s))}
              >
                ✕
              </button>
            </span>
          )}
        </span>
      </div>

      {!shaded && (
        <>
          <div className={cn("min-h-0 flex-1 p-2.5", bodyClassName)}>
            {children}
          </div>
          {statusBar && <div className="status-bar">{statusBar}</div>}
        </>
      )}
    </motion.div>
  );
}
