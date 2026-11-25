"use client";

import { createContext, useContext } from "react";
import { api } from "@/shared/api";
import type { Settings } from "@/shared/types/models";
import { useQuery } from "./use-query";

interface SettingsState {
  data: Settings | null;
  error: string | null;
  reload: () => void;
}

const SettingsContext = createContext<SettingsState>({ data: null, error: null, reload: () => {} });

/** 학원·선생님 설정을 한 번만 불러와 셸(사이드바·인사말)과 설정 화면이 함께 쓴다. 저장 후 reload()하면 양쪽에 바로 반영된다. */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data, error, reload } = useQuery(() => api.settings.get(), []);
  return <SettingsContext.Provider value={{ data, error, reload }}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
