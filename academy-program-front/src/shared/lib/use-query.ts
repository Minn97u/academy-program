"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/shared/api";

interface State<T> {
  key: string;
  depsKey: string;
  data: T | null;
  error: string | null;
}

/**
 * 가장 단순한 조회 훅. deps가 바뀌면 다시 불러오고, reload()로 수동 갱신한다. 갱신 중에는 이전 data를 유지한다.
 * stale은 지금 data가 이전 deps의 결과일 때 true (같은 deps를 reload하는 동안은 false).
 */
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [tick, setTick] = useState(0);
  const depsKey = JSON.stringify(deps);
  const key = `${depsKey}#${tick}`;
  const [state, setState] = useState<State<T>>({ key: "", depsKey: "", data: null, error: null });

  useEffect(() => {
    let alive = true;
    fn().then(
      (data) => alive && setState({ key, depsKey, data, error: null }),
      (e: unknown) =>
        alive && setState((s) => ({ key, depsKey: s.depsKey, data: s.data, error: e instanceof ApiError ? e.message : "불러오는 중 오류가 발생했어요" })),
    );
    return () => {
      alive = false;
    };
    // fn은 매 렌더마다 새로 만들어지므로 key로만 동기화한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const settled = state.key === key;
  const stale = state.data !== null && state.depsKey !== depsKey;
  return { data: state.data, error: settled ? state.error : null, loading: !settled, stale, reload };
}
