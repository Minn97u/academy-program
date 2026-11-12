"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHead } from "@/features/shell/PageHead";
import { api, ApiError } from "@/shared/api";
import { dot } from "@/shared/lib/date";
import { EXAM_TYPES, examStatus, resultStatus, score } from "@/shared/lib/format";
import { useQuery } from "@/shared/lib/use-query";
import type { ExamDetail } from "@/shared/types/models";
import { Empty, ErrorBox, Loading, Tabs } from "@/shared/ui/controls";
import { Icon } from "@/shared/ui/Icon";
import { useToast } from "@/shared/ui/toast";

type Tab = "entry" | "results";
type Draft = { absent: boolean; score: string; wrong: number[] };
type Participant = ExamDetail["students"][number];

const parseWrong = (text: string, max: number) =>
  Array.from(new Set(text.split(/[,\s]+/).map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= max))).sort((a, b) => a - b);

export function ExamDetailPage({ id }: { id: number }) {
  const router = useRouter();
  const toast = useToast();
  const { data: exam, error, reload } = useQuery(() => api.exams.get(id), [id]);
  const [tab, setTab] = useState<Tab>("entry");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (error) return <ErrorBox message={error} />;
  if (!exam) return <Loading />;

  const st = examStatus(exam);
  const remove = async () => {
    await api.exams.remove(id);
    toast(`'${exam.name}' 시험을 삭제했어요`);
    router.push("/exams");
  };

  return (
    <div className="page stack gap20">
      <PageHead title={exam.name} desc={[EXAM_TYPES[exam.type].label, exam.className, dot(exam.date)]} back={{ href: "/exams", label: "시험 관리" }} />
      <section className="card card-pad">
        <div className="row between wrap gap12">
          <div className="stack gap6">
            <div className="row gap8 wrap">
              <span className="bdg t-mute">{EXAM_TYPES[exam.type].label}</span>
              <span className={`bdg ${st.tone}`}>{st.label}</span>
            </div>
            <h2 className="h2-l">{exam.name}</h2>
            <div className="small muted row gap16 wrap">
              <Link href={`/classes/${exam.classId}`} className="link-b">
                {exam.className}
              </Link>
              <span>{dot(exam.date)}</span>
              <span>총점 {exam.total}점</span>
              <span>{exam.questionCount}문항</span>
            </div>
          </div>
        </div>
        <div className="meta-grid">
          <div className="meta">
            <span className="meta-l">입력 현황</span>
            <span className="meta-v num">
              {exam.enteredCount}/{exam.participantCount}
              <span className="kpi-u">명</span>
            </span>
          </div>
          <div className="meta">
            <span className="meta-l">평균 점수</span>
            <span className="meta-v num">{score(exam.avgScore)}</span>
          </div>
          <div className="meta">
            <span className="meta-l">최고 점수</span>
            <span className="meta-v num">{score(exam.maxScore)}</span>
          </div>
          <div className="meta">
            <span className="meta-l">최저 점수</span>
            <span className="meta-v num">{score(exam.minScore)}</span>
          </div>
        </div>
      </section>

      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: "entry", label: "성적 입력" },
          { value: "results", label: "학생별 결과" },
        ]}
      />

      {exam.students.length === 0 && (
        <div className="card empty">
          <p className="empty-t">응시 대상 학생이 없어요</p>
          <p className="small muted">대상 반에 시험일 기준으로 등록된 학생이 없습니다.</p>
        </div>
      )}
      {exam.students.length > 0 && tab === "entry" && <Entry exam={exam} onSaved={reload} />}
      {exam.students.length > 0 && tab === "results" && <Results exam={exam} />}

      <div className="row between wrap gap8" style={{ paddingTop: 8 }}>
        <span className="xs muted">시험을 삭제하면 입력된 학생 결과도 함께 삭제됩니다.</span>
        {confirmDelete ? (
          <div className="row gap6">
            <button type="button" className="btn btn-g btn-sm" onClick={() => setConfirmDelete(false)}>
              취소
            </button>
            <button type="button" className="btn btn-d btn-sm" onClick={remove}>
              삭제 실행
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-d btn-sm" onClick={() => setConfirmDelete(true)}>
            시험 삭제
          </button>
        )}
      </div>
    </div>
  );
}

/** 성적 입력: 왼쪽 학생 목록, 오른쪽 선택 학생 편집기. */
function Entry({ exam, onSaved }: { exam: ExamDetail; onSaved: () => void }) {
  const [idx, setIdx] = useState(0);
  const pos = Math.min(idx, exam.students.length - 1);
  const cur = exam.students[pos];
  const pct = Math.round((exam.enteredCount / exam.participantCount) * 100);

  return (
    <div className="entry">
      <section className="card">
        <div className="card-hp stack gap10">
          <div>
            <h3 className="card-t">학생별 결과</h3>
            <p className="card-s">행을 선택하면 오른쪽에서 입력할 수 있어요</p>
          </div>
          <div className="row gap10">
            <div className="prog grow">
              <i style={{ width: `${pct}%` }} />
            </div>
            <span className="xs b num">
              {exam.enteredCount}/{exam.participantCount}명 입력
            </span>
          </div>
        </div>
        <div className="tbl-wrap">
          <div className="th c-ent">
            <span>학생 이름</span>
            <span>점수</span>
            <span>오답 문항</span>
            <span>입력 상태</span>
          </div>
          {exam.students.map((s, i) => {
            const rs = resultStatus(s.result?.status);
            return (
              <button key={s.id} type="button" className={`tr c-ent${i === pos ? " sel" : ""}`} onClick={() => setIdx(i)}>
                <span className="b">{s.name}</span>
                <span className="b num">{s.result?.status === "ABSENT" ? "—" : score(s.result?.score)}</span>
                <span className="small muted ell">{s.result?.wrongNumbers.length ? s.result.wrongNumbers.join(", ") : "—"}</span>
                <span>
                  <span className={`bdg ${rs.tone}`}>{rs.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 학생이나 저장된 결과가 바뀜뱴 key가 바뀌어 입력창이 초기화된다. */}
      <Editor
        key={`${cur.id}:${cur.result?.updatedAt ?? ""}`}
        exam={exam}
        student={cur}
        pos={pos}
        onMove={setIdx}
        onSaved={onSaved}
      />
    </div>
  );
}

function Editor({
  exam,
  student: cur,
  pos,
  onMove,
  onSaved,
}: {
  exam: ExamDetail;
  student: Participant;
  pos: number;
  onMove: (i: number) => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const saved = cur.result;
  const [draft, setDraft] = useState<Draft>({
    absent: saved?.status === "ABSENT",
    score: saved?.score == null ? "" : String(saved.score),
    wrong: saved?.wrongNumbers ?? [],
  });
  const [wrongText, setWrongText] = useState((saved?.wrongNumbers ?? []).join(", "));
  const [err, setErr] = useState("");
  const last = exam.students.length - 1;

  const setWrong = (wrong: number[]) => {
    setDraft((d) => ({ ...d, wrong }));
    setWrongText(wrong.join(", "));
  };
  const toggle = (n: number) => setWrong(draft.wrong.includes(n) ? draft.wrong.filter((x) => x !== n) : [...draft.wrong, n].sort((a, b) => a - b));

  const save = async (next: boolean) => {
    const n = Number(draft.score);
    if (!draft.absent && (draft.score === "" || !Number.isFinite(n))) return setErr("점수를 입력하세요.");
    if (!draft.absent && (n < 0 || n > exam.total)) return setErr(`점수는 0~${exam.total}점 사이여야 합니다.`);
    try {
      await api.exams.saveResult(exam.id, cur.id, draft.absent ? { status: "ABSENT" } : { status: "DONE", score: n, wrongNumbers: draft.wrong });
      toast(`${cur.name} 결과를 저장했어요`);
      onSaved();
      if (next && pos < last) onMove(pos + 1);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "저장에 실패했어요");
    }
  };
  const clear = async () => {
    if (!saved) return;
    await api.exams.removeResult(exam.id, cur.id);
    toast("입력을 지웠어요");
    onSaved();
  };
  const onKey = (e: React.KeyboardEvent) => e.key === "Enter" && save(true);

  return (
      <section className="card card-pad stack gap16 editor">
        <div className="row between gap8">
          <div>
            <span className="xs muted num">
              {pos + 1} / {exam.students.length}
            </span>
            <h3 className="h2">{cur.name}</h3>
          </div>
          <div className="row gap6">
            <button type="button" className="btn btn-s btn-sm btn-icon" onClick={() => onMove(pos - 1)} disabled={pos === 0} aria-label="이전 학생">
              <Icon name="chevL" size="s" />
            </button>
            <button type="button" className="btn btn-s btn-sm btn-icon" onClick={() => onMove(pos + 1)} disabled={pos === last} aria-label="다음 학생">
              <Icon name="chevR" size="s" />
            </button>
          </div>
        </div>
        <div className="field">
          <div className="row between">
            <label className="lab" htmlFor="score-inp">
              점수 <span className="muted">/ {exam.total}점</span>
            </label>
            <button type="button" className="xs link-b" onClick={() => setDraft({ ...draft, absent: !draft.absent })}>
              {draft.absent ? "응시로 변경" : "미응시 처리"}
            </button>
          </div>
          <input
            id="score-inp"
            className="inp score-inp"
            type="number"
            inputMode="numeric"
            placeholder={draft.absent ? "미응시" : "점수 입력"}
            value={draft.absent ? "" : draft.score}
            onChange={(e) => setDraft({ ...draft, score: e.target.value })}
            onKeyDown={onKey}
            disabled={draft.absent}
          />
          {err && <span className="err-t">{err}</span>}
        </div>
        <div className="field">
          <div className="row between">
            <span className="lab">
              틀린 문항 선택 <span className="muted">({draft.wrong.length}개)</span>
            </span>
            <button type="button" className="xs link-b" onClick={() => setWrong([])} disabled={draft.absent}>
              선택 해제
            </button>
          </div>
          <div className="qgrid">
            {Array.from({ length: exam.questionCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`qb${draft.wrong.includes(n) ? " on" : ""}`}
                onClick={() => toggle(n)}
                aria-label={`${n}번 문항`}
                aria-pressed={draft.wrong.includes(n)}
                disabled={draft.absent}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label className="lab" htmlFor="wrong-inp">
            직접 입력
          </label>
          <input
            id="wrong-inp"
            className="inp"
            placeholder="예: 3, 7, 12, 18"
            value={wrongText}
            onChange={(e) => setWrongText(e.target.value)}
            onBlur={() => setWrong(parseWrong(wrongText, exam.questionCount))}
            onKeyDown={onKey}
            disabled={draft.absent}
          />
        </div>
        <div className="row between gap8 wrap" style={{ borderTop: "1px solid #F2F2EF", paddingTop: 14 }}>
          <span className="xs muted row gap6">
            {saved ? (
              <>
                <Icon name="check" size="s" />
                저장됨
                <button type="button" className="link-b" onClick={clear}>
                  입력 지우기
                </button>
              </>
            ) : (
              "아직 저장되지 않았어요"
            )}
          </span>
          <div className="row gap6">
            <button type="button" className="btn btn-s" onClick={() => save(false)}>
              저장
            </button>
            <button type="button" className="btn btn-p" onClick={() => save(true)}>
              저장 후 다음 학생
            </button>
          </div>
        </div>
        <p className="xs muted">Enter 키로 저장 후 다음 학생으로 이동합니다.</p>
      </section>
  );
}

/** 학생별 결과: 점수 순 랭킹 표. */
function Results({ exam }: { exam: ExamDetail }) {
  const done = exam.students.filter((s) => s.result?.status === "DONE" && s.result.score != null).sort((a, b) => (b.result?.score ?? 0) - (a.result?.score ?? 0));
  const rest = exam.students.filter((s) => !done.includes(s));
  if (done.length === 0) return <Empty title="입력된 결과가 없어요" desc="성적 입력 탭에서 학생별 점수를 먼저 입력하세요." />;

  // 동점은 같은 순위(1, 1, 3 방식).
  const ranked = done.map((s) => ({ s, rank: done.findIndex((x) => x.result?.score === s.result?.score) + 1 }));

  return (
    <section className="card tbl-wrap">
      <div className="th c-er">
        <span>순위</span>
        <span>학생 이름</span>
        <span>시험 점수</span>
        <span>반 평균 대비</span>
        <span>오답 문항 수</span>
      </div>
      {ranked.map(({ s, rank }) => {
        const sc = s.result?.score ?? 0;
        const d = exam.avgScore == null ? null : Math.round((sc - exam.avgScore) * 10) / 10;
        return (
          <Link key={s.id} href={`/students/${s.id}`} className="tr c-er">
            <span className="rank-n">{rank}위</span>
            <span className="b">{s.name}</span>
            <span className="b num">{sc}점</span>
            <span className={`delta ${d == null || d === 0 ? "flat" : d > 0 ? "up" : "down"}`}>{d == null ? "—" : `${d > 0 ? "+" : ""}${d}점`}</span>
            <span className="small num">{s.result?.wrongNumbers.length ? `${s.result.wrongNumbers.length}개` : "—"}</span>
          </Link>
        );
      })}
      {rest.map((s) => {
        const rs = resultStatus(s.result?.status);
        return (
          <Link key={s.id} href={`/students/${s.id}`} className="tr c-er">
            <span className="rank-n">—</span>
            <span className="b">{s.name}</span>
            <span>
              <span className={`bdg ${rs.tone}`}>{rs.label}</span>
            </span>
            <span className="muted">—</span>
            <span className="muted">—</span>
          </Link>
        );
      })}
      <p className="xs muted" style={{ padding: "12px 20px 16px" }}>
        동점은 같은 순위로 표시되며, 미입력·미응시 학생은 순위에서 제외됩니다.
      </p>
    </section>
  );
}
