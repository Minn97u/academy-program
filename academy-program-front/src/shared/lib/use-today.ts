"use client";

import { useSyncExternalStore } from "react";
import { today } from "./date";

const noop = () => () => {};

/** 브라우저에서 계산한 오늘 날짜('YYYY-MM-DD'). 서버 렌더·프리렌더 중에는 null. */
export const useToday = () => useSyncExternalStore(noop, today, () => null);

/** 브라우저 기준 현재 시(0–23). 서버 렌더·프리렌더 중에는 null. */
export const useHour = () => useSyncExternalStore(noop, () => new Date().getHours(), () => null);
