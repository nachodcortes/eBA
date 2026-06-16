import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useFocusEffect } from "expo-router";

export default function useAutoRefresh(
  refresh: () => Promise<void> | void,
  intervalMs = 5000,
  enabled = true
) {
  const refreshingRef = useRef(false);

  const refreshSafely = useCallback(async () => {
    if (!enabled || refreshingRef.current) return;
    if (
      Platform.OS === "web" &&
      typeof document !== "undefined" &&
      document.hidden
    ) {
      return;
    }

    try {
      refreshingRef.current = true;
      await refresh();
    } finally {
      refreshingRef.current = false;
    }
  }, [enabled, refresh]);

  useEffect(() => {
    if (Platform.OS !== "web" || !enabled) return;

    const intervalId = setInterval(refreshSafely, intervalMs);

    return () => clearInterval(intervalId);
  }, [enabled, intervalMs, refreshSafely]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "web" || !enabled) return;

      const intervalId = setInterval(refreshSafely, intervalMs);

      return () => clearInterval(intervalId);
    }, [enabled, intervalMs, refreshSafely])
  );
}
