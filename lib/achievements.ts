import {
  type LucideIcon,
  Flame,
  Clock,
  Star,
  Sun,
  Moon,
  Play,
  Apple,
  Award,
} from "lucide-react";

export interface AchievementSnapshot {
  totalSessions: number;
  totalMinutes: number;
  streakDays: number;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  /** Returns true when this achievement is unlocked. */
  check: (s: AchievementSnapshot) => boolean;
}

/**
 * Static achievement registry. To add a new one, just append to the array.
 * The check function is called with the user's snapshot on every render
 * of the achievements page.
 */
export const ACHIEVEMENTS: Achievement[] = [
  { id: "first",    name: "First step",     desc: "Finish your first focus session",  icon: Play,  check: (s) => s.totalSessions >= 1 },
  { id: "streak3",  name: "Three in a row", desc: "Maintain a 3-day study streak",   icon: Flame, check: (s) => s.streakDays >= 3 },
  { id: "streak7",  name: "Week warrior",   desc: "Maintain a 7-day study streak",   icon: Flame, check: (s) => s.streakDays >= 7 },
  { id: "streak30", name: "Monthly mind",   desc: "Maintain a 30-day streak",         icon: Flame, check: (s) => s.streakDays >= 30 },
  { id: "hr10",     name: "Tenacious",      desc: "Log 10 hours of focus",            icon: Clock, check: (s) => s.totalMinutes >= 600 },
  { id: "hr100",    name: "Centurion",      desc: "Log 100 hours of focus",           icon: Clock, check: (s) => s.totalMinutes >= 6_000 },
  { id: "hr500",    name: "Iron mind",      desc: "Log 500 hours of focus",           icon: Award, check: (s) => s.totalMinutes >= 30_000 },
  { id: "pom50",    name: "Pomodoro pro",   desc: "Complete 50 pomodoros",            icon: Apple, check: (s) => s.totalSessions >= 50 },
  { id: "pom200",   name: "Tomato titan",   desc: "Complete 200 pomodoros",           icon: Apple, check: (s) => s.totalSessions >= 200 },
  { id: "early",    name: "Early bird",     desc: "Start a session before 7am",       icon: Sun,   check: () => false },
  { id: "night",    name: "Night owl",      desc: "Study past midnight",              icon: Moon,  check: () => false },
  { id: "all7",     name: "Full sweep",     desc: "Hit every daily goal in one day",  icon: Star,  check: () => false },
];
