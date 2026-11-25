import Link from "next/link";
import { Icon } from "@/shared/ui/Icon";

/** 페이지 제목, 설명, 뒤로 가기, 주요 행동 — 본문 첫 줄. */
export function PageHead({
  title,
  desc,
  back,
  action,
}: {
  title: string;
  desc?: (string | null | undefined)[] | string;
  back?: { href: string; label: string };
  action?: React.ReactNode;
}) {
  const parts = (Array.isArray(desc) ? desc : [desc]).filter(Boolean);
  return (
    <div className="pg-head">
      <div className="pg-head-t">
        {back && (
          <Link href={back.href} className="pg-back">
            <Icon name="chevL" size="s" />
            {back.label}
          </Link>
        )}
        <h1 className="h1">{title}</h1>
        {parts.length > 0 && (
          <p className="pg-desc meta-row">
            {parts.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
