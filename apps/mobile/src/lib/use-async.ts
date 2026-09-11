import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

/**
 * Read something, and read it again when the screen comes back.
 *
 * No data-fetching library. What this app needs from one is a loading flag, a
 * refetch on focus and pull-to-refresh — and the middle one is the whole reason
 * a phone differs from the web here: progress made inside a lesson has to show
 * on the list behind it when you come back, and `useFocusEffect` is what does
 * that.
 *
 * The mounted ref is not ceremony. Navigating away mid-request, or pulling to
 * refresh and then leaving, would otherwise set state on a screen that is gone.
 */
export function useAsync<T>(
  read: () => Promise<T>,
  deps: readonly unknown[] = [],
): { data: T | null; loading: boolean; refreshing: boolean; refresh: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- the caller owns deps
  const run = useCallback(read, deps);

  const load = useCallback(async () => {
    try {
      const value = await run();
      if (mounted.current) setData(value);
    } catch {
      if (mounted.current) setData(null);
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [run]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  return { data, loading, refreshing, refresh };
}
