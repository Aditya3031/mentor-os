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
import { useStore } from "@/lib/store";
import { getSkin, windowTitle, type ChromeStyle } from "@/lib/skins";

/**
 * Desktop = drag bounds + z-order registry for windows.
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
  /** Canonical retro name ("FOCUS.EXE"); each skin derives its own label */
  title: string;
  /** Small glyph rendered before the title (e.g. a 12px lucide icon) */
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Enable drag-by-header (only within a <Desktop>) */
  draggable?: boolean;
  /** ✕ handler (os chrome only). Without it, ✕ shades the window. */
  onClose?: () => void;
  /** Extra content pinned to the right side of the header */
  titleExtra?: React.ReactNode;
  /** Render the sunken status strip below the body */
  statusBar?: React.ReactNode;
  /** Skip rendering the — □ ✕ button cluster (os chrome only) */
  noControls?: boolean;
}

/** Per-paradigm shell + body classes. Headers are rendered separately. */
const SHELL: Record<ChromeStyle, { shell: string; body: string }> = {
  os: { shell: "win95 p-[3px]", body: "p-2.5" },
  hud: { shell: "hud-shell", body: "p-3" },
  tty: { shell: "tty-shell", body: "p-3 pt-4" },
  paper: { shell: "paper-shell", body: "p-3" },
  deck: { shell: "deck-shell", body: "p-3" },
  sheet: { shell: "sheet-shell", body: "p-3" },
};

/**
 * A window in the active skin's paradigm. Retro/mono render OS windows
 * with title-bar buttons; every other skin renders its own standalone
 * chrome — HUD frames, tty panes, washi cards, deck strips, sheets.
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

  const skinId = useStore((s) => s.skin);
  const chrome = getSkin(skinId).chrome;
  const label = windowTitle(title, skinId);

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

  const headerProps = {
    onPointerDown: (e: React.PointerEvent) => {
      if (!canDrag) return;
      if ((e.target as HTMLElement).closest("button")) return;
      dragControls.start(e);
    },
  };
  const dragCls = canDrag ? "cursor-move touch-none" : "";

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
      className={cn(SHELL[chrome].shell, "flex flex-col", className)}
    >
      {chrome === "os" && (
        <div className={cn("title-bar justify-between", dragCls)} {...headerProps}>
          <span className="flex min-w-0 items-center gap-1.5">
            {icon && (
              <span className="flex-shrink-0 [&>svg]:h-3 [&>svg]:w-3">{icon}</span>
            )}
            <span className="truncate">{label}</span>
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
      )}

      {chrome === "hud" && (
        <div className={cn("hud-head", dragCls)} {...headerProps}>
          <span className="hud-led" aria-hidden />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {titleExtra}
          <button
            className="hud-toggle"
            aria-label={shaded ? "Expand module" : "Collapse module"}
            onClick={() => setShaded((s) => !s)}
          >
            {shaded ? "◇" : "◆"}
          </button>
        </div>
      )}

      {chrome === "tty" && (
        <div className={cn("tty-title", dragCls)} {...headerProps}>
          <button
            className="lowercase outline-none"
            aria-label={shaded ? "Expand pane" : "Collapse pane"}
            onClick={() => setShaded((s) => !s)}
          >
            ┤ {label} ├
          </button>
          {titleExtra && <span className="ml-2">{titleExtra}</span>}
        </div>
      )}

      {chrome === "paper" && (
        <div className={cn("paper-head", dragCls)} {...headerProps}>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {titleExtra}
          <button
            className="paper-seal"
            aria-label={shaded ? "Open" : "Fold"}
            onClick={() => setShaded((s) => !s)}
            title={shaded ? "open" : "fold"}
          >
            印
          </button>
        </div>
      )}

      {chrome === "deck" && (
        <div className={cn("deck-head", dragCls)} {...headerProps}>
          <span className="deck-led" aria-hidden />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {titleExtra}
          <button
            className="deck-toggle"
            aria-label={shaded ? "Expand" : "Collapse"}
            onClick={() => setShaded((s) => !s)}
          >
            {shaded ? "▸" : "▾"}
          </button>
        </div>
      )}

      {chrome === "sheet" && (
        <div className={cn("sheet-head", dragCls)} {...headerProps}>
          <span className="sheet-tab">{label}</span>
          <span className="flex-1" />
          {titleExtra}
          <button
            className="sheet-toggle"
            aria-label={shaded ? "Unroll sheet" : "Roll sheet"}
            onClick={() => setShaded((s) => !s)}
          >
            {shaded ? "＋" : "−"}
          </button>
        </div>
      )}

      {!shaded && (
        <>
          <div className={cn("min-h-0 flex-1", SHELL[chrome].body, bodyClassName)}>
            {children}
          </div>
          {statusBar && <div className="status-bar">{statusBar}</div>}
        </>
      )}
    </motion.div>
  );
}
