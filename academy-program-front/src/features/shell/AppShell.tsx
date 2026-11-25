"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { fullDate } from "@/shared/lib/date";
import { SettingsProvider, useSettings } from "@/shared/lib/settings";
import { useHour, useToday } from "@/shared/lib/use-today";
import { Icon, type IconName } from "@/shared/ui/Icon";
import { ToastProvider } from "@/shared/ui/toast";

const SECTIONS: { title: string; items: { href: string; label: string; icon: IconName }[] }[] = [
  {
    title: "메인",
    items: [
      { href: "/", label: "홈", icon: "home" },
      { href: "/classes", label: "정규반 관리", icon: "layers" },
      { href: "/students", label: "학생 관리", icon: "users" },
      { href: "/exams", label: "시험 관리", icon: "file" },
    ],
  },
  { title: "운영 관리", items: [{ href: "/attendance", label: "출결 관리", icon: "calcheck" }] },
];

function greeting(h: number | null) {
  if (h == null) return "안녕하세요";
  if (h >= 5 && h < 11) return "좋은 아침이에요";
  if (h >= 11 && h < 14) return "점심은 챙겨 드셨나요";
  if (h >= 14 && h < 18) return "오후 수업도 힘내세요";
  if (h >= 18 && h < 22) return "저녁 수업까지 수고 많으세요";
  return "오늘도 수고 많으셨어요";
}

type NavLinkProps = { href: string; title: string; onClick: () => void; children: React.ReactNode };

function ActiveLink({ href, ...rest }: NavLinkProps) {
  const pathname = usePathname();
  const on = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return <Link href={href} className={`nav${on ? " on" : ""}`} {...rest} />;
}

/** usePathname은 런타임 값이라 Suspense로 감싸 셸 프리렌더를 막지 않게 한다. */
function NavLink(props: NavLinkProps) {
  return (
    <Suspense fallback={<Link className="nav" {...props} />}>
      <ActiveLink {...props} />
    </Suspense>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <Shell>{children}</Shell>
    </SettingsProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: settings } = useSettings();
  const todayStr = useToday();
  const hour = useHour();
  const teacher = settings?.teacher.name ?? "선생님";
  const academy = settings?.academyName ?? "";

  return (
    <ToastProvider>
      <div className="app">
        {mobileOpen && <button type="button" className="scrim" onClick={() => setMobileOpen(false)} aria-label="메뉴 닫기" />}
        <aside className={`sb${collapsed ? " collapsed" : ""}${mobileOpen ? " mopen" : ""}`}>
          <div className="brand">
            <span className="brand-mark">AP</span>
            <div className="brand-txt">
              <div className="brand-name">Academy Program</div>
              <div className="brand-sub">학원 관리 프로그램</div>
            </div>
          </div>
          {SECTIONS.map((sec) => (
            <div key={sec.title} className="stack" style={{ gap: 2 }}>
              <div className="sec">{sec.title}</div>
              {sec.items.map((n) => (
                <NavLink key={n.href} href={n.href} title={n.label} onClick={() => setMobileOpen(false)}>
                  <Icon name={n.icon} />
                  <span className="lbl">{n.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
          <div className="sb-foot">
            <NavLink href="/settings" title="설정" onClick={() => setMobileOpen(false)}>
              <Icon name="settings" />
              <span className="lbl">설정</span>
            </NavLink>
            <button type="button" className="nav hide-m" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "사이드바 펼치기" : "사이드바 접기"}>
              <Icon name="panel" />
              <span className="lbl">{collapsed ? "사이드바 펼치기" : "사이드바 접기"}</span>
            </button>
            <Link href="/settings" className="prof" title="사용자 프로필">
              <span className="avatar">{teacher.slice(-2)}</span>
              <span className="lbl stack">
                <span className="b small">{teacher} 선생님</span>
                <span className="xs muted">{academy}</span>
              </span>
            </Link>
          </div>
        </aside>

        <div className="main">
          <header className="hdr">
            <button type="button" className="btn btn-s btn-icon mob-only" onClick={() => setMobileOpen(true)} aria-label="메뉴 열기">
              <Icon name="menu" />
            </button>
            <div className="hdr-greet">
              <span className="hdr-hi ell">
                {greeting(hour)}, {teacher} 선생님
              </span>
              <span className="hdr-sub ell">
                {todayStr ? fullDate(todayStr) : ""}
                {academy ? `, ${academy}` : ""}
              </span>
            </div>
          </header>
          <main className="content">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
