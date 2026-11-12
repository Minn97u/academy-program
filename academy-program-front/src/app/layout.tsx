import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/features/shell/AppShell";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "Academy Program",
  description: "학원 선생님을 위한 정규반·학생·시험·출결 관리",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AppShell>
          <Suspense fallback={null}>{children}</Suspense>
        </AppShell>
      </body>
    </html>
  );
}
