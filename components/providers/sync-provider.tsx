"use client";

import { useEffect, useRef } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useUser } from "@/lib/auth";
import {
  getSyncedStateSnapshot,
  type SyncedFocusFlowState,
  useStore,
} from "@/lib/store";

const TABLE = "focusflow_state";
const SAVE_DELAY_MS = 900;

type FocusFlowStateRow = {
  user_id: string;
  state: SyncedFocusFlowState;
};

export function SyncProvider() {
  const user = useUser();
  const hydrateFromSync = useStore((s) => s.hydrateFromSync);
  const readyUserRef = useRef<string | null>(null);
  const hydratingRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user?.id) {
      readyUserRef.current = null;
      return;
    }

    const client = supabase;
    const userId = user.id;
    let cancelled = false;
    readyUserRef.current = null;

    async function loadRemoteState() {
      const { data, error } = await client
        .from(TABLE)
        .select("state")
        .eq("user_id", userId)
        .maybeSingle<Pick<FocusFlowStateRow, "state">>();

      if (cancelled) return;

      if (error) {
        console.warn("FocusFlow sync load failed:", error.message);
        return;
      }

      if (data?.state) {
        hydratingRef.current = true;
        hydrateFromSync(data.state);
        queueMicrotask(() => {
          hydratingRef.current = false;
          readyUserRef.current = userId;
        });
        return;
      }

      const state = getSyncedStateSnapshot();
      const { error: saveError } = await client
        .from(TABLE)
        .upsert({ user_id: userId, state }, { onConflict: "user_id" });

      if (saveError) {
        console.warn("FocusFlow initial sync save failed:", saveError.message);
        return;
      }

      readyUserRef.current = userId;
    }

    void loadRemoteState();

    return () => {
      cancelled = true;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [hydrateFromSync, user?.id]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user?.id) return;

    const client = supabase;
    const userId = user.id;
    const unsubscribe = useStore.subscribe(() => {
      if (readyUserRef.current !== userId || hydratingRef.current) return;

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      saveTimerRef.current = setTimeout(() => {
        const state = getSyncedStateSnapshot();

        void client
          .from(TABLE)
          .upsert({ user_id: userId, state }, { onConflict: "user_id" })
          .then(({ error }) => {
            if (error) {
              console.warn("FocusFlow sync save failed:", error.message);
            }
          });
      }, SAVE_DELAY_MS);
    });

    return () => {
      unsubscribe();
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [user?.id]);

  return null;
}
