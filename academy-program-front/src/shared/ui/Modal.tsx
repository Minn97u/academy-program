"use client";

import { useEffect } from "react";
import { Icon } from "./Icon";

export function Modal({
  title,
  desc,
  onClose,
  footer,
  children,
  width,
}: {
  title: string;
  desc?: string;
  onClose: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
  width?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-label={title} style={width ? { width: `min(${width}px, 100%)` } : undefined}>
        <div className="modal-h">
          <div>
            <h3 className="h2">{title}</h3>
            {desc && <p className="card-s">{desc}</p>}
          </div>
          <button type="button" className="btn btn-g btn-icon" onClick={onClose} aria-label="닫기">
            <Icon name="x" />
          </button>
        </div>
        <div className="modal-b">{children}</div>
        <div className="modal-f">{footer}</div>
      </div>
    </div>
  );
}
