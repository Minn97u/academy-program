import Link from "next/link";
import { delta, dirCls, initial, pct, score, signed } from "@/shared/lib/format";
import type { Student } from "@/shared/types/models";

/** 학생 목록·반 상세에서 공통으로 쓰는 행. */
export function StudentRow({ s, cls }: { s: Student; cls: "c-stu" | "c-cstu" }) {
  const d = delta(s.scores);
  return (
    <Link href={`/students/${s.id}`} className={`tr ${cls}`}>
      <span className="row gap10">
        <span className="avatar">{initial(s.name)}</span>
        <span className="b">{s.name}</span>
      </span>
      {cls === "c-stu" && <span>{s.grade}</span>}
      {cls === "c-stu" && <span className="muted ell">{s.className ?? "미배정"}</span>}
      <span className="b num">{score(s.recentScore)}</span>
      <span className="num">{score(s.avgScore)}</span>
      <span className={`delta ${dirCls(d)}`}>{signed(d)}</span>
      <span className="num">{pct(s.attendance.rate)}</span>
      {cls === "c-stu" && (
        <span>
          <span className="bdg t-mute">시험 {s.scores.length}회</span>
        </span>
      )}
    </Link>
  );
}
