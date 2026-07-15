/**
 * The floating macOS dock is dead; long live the taskbar.
 * Kept as a re-export so every page that imported <Dock /> gets
 * the retro taskbar without touching its imports.
 */
export { Taskbar as Dock } from "@/components/retro/taskbar";
