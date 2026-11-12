"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/shared/api";

interface State<T> {
  key: string;
  data: T | null;
  error: string | null;
}

/** 가장 단순한 조회 훅. deps가 바뀌면 다시 불러오고, reload()로 수동 갱신한다. 갱신 중에는 이전 data를 유지한다. */
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [tick, setTick] = useState(0);
  const key = JSON.stringify([...deps, tick]);
  const [state, setState] = useState<State<T>>({ key: "", data: null, error: null });

  useEffect(() => {
    let alive = true;
    fn().then(
      (data) => alive && setState({ key, data, error: null }),
      (e: unknown) =>
        alive && setState((s) => ({ key, data: s.data, error: e instanceof ApiError ? e.message : "불러오는 중 오류가 발생했어요" })),
    );
    return () => {
      alive = false;
    };
    // fn은 매 렌더마다 새로 만들어지므로 key로만 동기화한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const settled = state.key === key;
  return { data: state.data, error: settled ? state.error : null, loading: !settled, reload };
}
