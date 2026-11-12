"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

export interface Option<T extends string | number> {
  value: T;
  label: string;
}

/** 목업 .dd 드롭다운. 바깥 클릭·ESC로 닫힌다. */
export function Dropdown<T extends string | number>({
  value,
  options,
  onChange,
  right,
  full,
  label,
}: {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  right?: boolean;
  full?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const current = options.find((o) => o.value === value);
  return (
    <div className={`dd${right ? " dd-r" : ""}`}>
      <button type="button" className={`dd-btn${full ? " full" : ""}`} onClick={() => setOpen(!open)} aria-label={label}>
        <span>{current?.label ?? "선택"}</span>
        <Icon name="chevD" size="s" />
      </button>
      {open && (
        <>
          <button type="button" className="dd-backdrop" onClick={() => setOpen(false)} aria-label="메뉴 닫기" />
          <div className={`dd-menu${full ? " full" : ""}`}>
            {options.map((o) => (
              <button
                key={String(o.value)}
                type="button"
                className={`dd-opt${o.value === value ? " on" : ""}`}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** 목업 .seg 세그먼트 컨트롤. */
export function Seg<T extends string | number>({ value, options, onChange }: { value: T; options: Option<T>[]; onChange: (v: T) => void }) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={String(o.value)} type="button" className={`seg-b${o.value === value ? " on" : ""}`} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Tabs<T extends string>({ value, options, onChange }: { value: T; options: Option<T>[]; onChange: (v: T) => void }) {
  return (
    <div className="tabs">
      {options.map((o) => (
        <button key={o.value} type="button" className={`tab${o.value === value ? " on" : ""}`} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** 목업 .chips 단일/다중 선택. */
export function Chips<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T | T[];
  options: Option<T>[];
  onChange: (v: T) => void;
}) {
  const on = (v: T) => (Array.isArray(value) ? value.includes(v) : value === v);
  return (
    <div className="chips">
      {options.map((o) => (
        <button key={String(o.value)} type="button" className={`chip-b${on(o.value) ? " on" : ""}`} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Empty({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="empty">
      <p className="empty-t">{title}</p>
      {desc && <p className="small muted">{desc}</p>}
      {action}
    </div>
  );
}

export function Loading() {
  return (
    <div className="empty">
      <p className="small muted">불러오는 중…</p>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return <div className="err-box">{message}</div>;
}
