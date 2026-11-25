"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHead } from "@/shared/ui/PageHead";
import { api, errorMessage } from "@/shared/api";
import { DOW, addMonths, dot, monthCells, monthLabel } from "@/shared/lib/date";
import { ATT_LABEL, EXAM_TYPES, NOTE_KINDS, delta, dirCls, initial, pct, resultStatus, score, signed } from "@/shared/lib/format";
import { useQuery } from "@/shared/lib/use-query";
import { useToday } from "@/shared/lib/use-today";
import { Chips, Empty, ErrorBox, Loading, Tabs } from "@/shared/ui/controls";
import { Icon } from "@/shared/ui/Icon";
import { useToast } from "@/shared/ui/toast";
import { StudentFormModal } from "./StudentFormModal";

type Tab = "records" | "attendance" | "notes";
const ATT_TONE = { PRESENT: "t-ok", LATE: "t-warn", ABSENT: "t-err" } as const;

export function StudentDetailPage({ id }: { id: number }) {
  const router = useRouter();
  const toast = useToast();
  const { data: s, error, reload } = useQuery(() => api.students.get(id), [id]);
  const [tab, setTab] = useState<Tab>("records");
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [calOffset, setCalOffset] = useState(0);
  const [note, setNote] = useState({ kind: NOTE_KINDS[0], text: "" });
  const today = useToday();

  if (error) return <ErrorBox message={error} />;
  if (!s || !today) return <Loading />;
  const calMonth = addMonths(today.slice(0, 7), calOffset);

  const d = delta(s.scores);
  // recentScore는 응시한 시험 기준이므로, 시험명도 미응시 기록을 건너뛴 최근 응시 시험에서 가져온다.
  const recentExam = s.records.find((r) => r.status === "DONE" && r.score != null);
  const attByDate = new Map(s.attendanceRecords.map((a) => [a.date, a]));

  const saveNote = async () => {
    if (!note.text.trim()) return;
    try {
      await api.students.addNote(id, { kind: note.kind, text: note.text.trim() });
      setNote({ ...note, text: "" });
      toast("메모를 저장했어요");
      reload();
    } catch (e) {
      toast(errorMessage(e, "메모를 저장하지 못했어요"));
    }
  };
  const removeNote = async (noteId: number) => {
    try {
      await api.students.removeNote(id, noteId);
    } catch (e) {
      toast(errorMessage(e, "메모를 삭제하지 못했어요"));
    }
    reload();
  };
  const remove = async () => {
    try {
      await api.students.remove(id);
      toast(`'${s.name}' 학생을 삭제했어요`);
      router.push("/students");
    } catch (e) {
      toast(errorMessage(e, "삭제에 실패했어요"));
    }
  };

  return (
    <div className="page stack gap20">
      <PageHead title={`${s.name} 학생`} desc={[s.grade, s.className ?? "미배정"]} back={{ href: "/students", label: "학생 관리" }} />
      <section className="card card-pad">
        <div className="row gap16 wrap">
          <div className="avatar-l">{initial(s.name)}</div>
          <div className="stack gap4 grow">
            <div className="row gap8 wrap">
              <h2 className="h2-l">{s.name}</h2>
              <span className="bdg tag">{s.grade}</span>
            </div>
            <div className="row gap16 wrap small muted">
              {s.classId ? (
                <Link href={`/classes/${s.classId}`} className="link-b">
                  {s.className}
                </Link>
              ) : (
                <span>미배정</span>
              )}
              {s.teacherName && <span>담당 {s.teacherName} 선생님</span>}
              <span>보호자 {s.phone || "—"}</span>
              <span>등록일 {dot(s.enrolledAt)}</span>
            </div>
            {s.memo && <p className="small muted">{s.memo}</p>}
          </div>
          <div className="row gap8 wrap">
            <button type="button" className="btn btn-s" onClick={() => setTab("notes")}>
              <Icon name="note" size="s" />
              메모 작성
            </button>
            <button type="button" className="btn btn-s" onClick={() => setEditing(true)}>
              <Icon name="edit" size="s" />
              정보 수정
            </button>
          </div>
        </div>
        <div className="meta-grid">
          <div className="meta">
            <span className="meta-l">최근 시험 점수</span>
            <span className="meta-v num">{score(s.recentScore)}</span>
            <span className="xs muted ell">{recentExam?.name ?? "응시 기록 없음"}</span>
          </div>
          <div className="meta">
            <span className="meta-l">평균 점수</span>
            <span className="meta-v num">{score(s.avgScore)}</span>
            <span className="xs muted">응시 {s.scores.length}회</span>
          </div>
          <div className="meta">
            <span className="meta-l">직전 시험 대비</span>
            <span className={`meta-v sm ${dirCls(d)}`}>{signed(d)}</span>
            <span className="xs muted">단순 점수 변화</span>
          </div>
          <div className="meta">
            <span className="meta-l">출석률</span>
            <span className="meta-v num">{pct(s.attendance.rate)}</span>
            <span className="xs muted meta-row">
              <span>지각 {s.attendance.late}회</span>
              <span>결석 {s.attendance.absent}회</span>
            </span>
          </div>
        </div>
      </section>

      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: "records", label: "시험 기록" },
          { value: "attendance", label: "출결 기록" },
          { value: "notes", label: "상담 및 메모" },
        ]}
      />

      {tab === "records" && (
        <section className="card tbl-wrap">
          <div className="th c-sex">
            <span>시험명</span>
            <span>유형</span>
            <span>시험 날짜</span>
            <span>점수</span>
            <span>반 평균</span>
            <span>틀린 문제</span>
            <span>입력 상태</span>
          </div>
          {s.records.map((x) => {
            const st = resultStatus(x.status);
            return (
              <Link key={x.examId} href={`/exams/${x.examId}`} className="tr c-sex">
                <span className="b ell">{x.name}</span>
                <span className="muted small">{EXAM_TYPES[x.type].label}</span>
                <span className="muted num">{dot(x.date)}</span>
                <span className="b num">{x.status === "ABSENT" ? "미응시" : score(x.score)}</span>
                <span className="num muted">{score(x.classAvg)}</span>
                <span className="num">{x.wrongNumbers.length ? `${x.wrongNumbers.length}개` : "—"}</span>
                <span>
                  <span className={`bdg ${st.tone}`}>{st.label}</span>
                </span>
              </Link>
            );
          })}
          {s.records.length === 0 && <Empty title="응시한 시험이 없어요." />}
        </section>
      )}

      {tab === "attendance" && (
        <div className="stack gap20">
          <div className="g g-4">
            <div className="card mini">
              <span className="xs muted">출석률</span>
              <span className="mini-v num">{pct(s.attendance.rate)}</span>
            </div>
            <div className="card mini">
              <span className="xs muted">출석</span>
              <span className="mini-v num">{s.attendance.present}회</span>
            </div>
            <div className="card mini">
              <span className="xs muted">지각</span>
              <span className="mini-v num">{s.attendance.late}회</span>
            </div>
            <div className="card mini">
              <span className="xs muted">결석</span>
              <span className="mini-v num">{s.attendance.absent}회</span>
            </div>
          </div>
          <section className="card card-pad">
            <div className="card-h">
              <h3 className="card-t">{monthLabel(calMonth)} 출결</h3>
              <div className="row gap6">
                <button type="button" className="btn btn-s btn-sm btn-icon" onClick={() => setCalOffset(calOffset - 1)} aria-label="이전 달">
                  <Icon name="chevL" size="s" />
                </button>
                <button type="button" className="btn btn-s btn-sm btn-icon" onClick={() => setCalOffset(calOffset + 1)} aria-label="다음 달">
                  <Icon name="chevR" size="s" />
                </button>
              </div>
            </div>
            <div className="cal">
              {DOW.map((w) => (
                <span key={w} className="cal-h">
                  {w}
                </span>
              ))}
              {monthCells(calMonth).map((date, i) => {
                if (!date) return <div key={`b${i}`} className="cal-c blank" />;
                const a = attByDate.get(date);
                return (
                  <div key={date} className={`cal-c${a ? "" : " off"}${date === today ? " today" : ""}`} title={a?.memo}>
                    <span className="cal-d">{Number(date.slice(8))}</span>
                    {a && <span className={`cal-s ${ATT_TONE[a.status]}`}>{ATT_LABEL[a.status]}</span>}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {tab === "notes" && (
        <div className="g g-main2">
          <section className="card card-pad stack gap12">
            <h3 className="card-t">새 메모</h3>
            <Chips value={note.kind} options={NOTE_KINDS.map((k) => ({ value: k, label: k }))} onChange={(kind) => setNote({ ...note, kind })} />
            <textarea
              className="inp"
              placeholder="학생의 학습 태도, 상담 내용, 다음 수업 계획 등을 기록하세요."
              value={note.text}
              onChange={(e) => setNote({ ...note, text: e.target.value })}
              aria-label="메모 내용"
            />
            <button type="button" className="btn btn-p" style={{ alignSelf: "flex-end" }} onClick={saveNote} disabled={!note.text.trim()}>
              메모 저장
            </button>
          </section>
          <section className="card card-pad stack gap12">
            <h3 className="card-t">
              기록 <span className="xs muted">{s.notes.length}건</span>
            </h3>
            {s.notes.map((n) => (
              <div key={n.id} className="wk">
                <div className="row between">
                  <span className="row gap8">
                    <span className="bdg tag">{n.kind}</span>
                    <span className="xs muted num">{dot(n.date)}</span>
                  </span>
                  <button type="button" className="btn btn-g btn-sm btn-icon" onClick={() => removeNote(n.id)} aria-label="메모 삭제">
                    <Icon name="trash" size="s" />
                  </button>
                </div>
                <p className="small" style={{ lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                  {n.text}
                </p>
              </div>
            ))}
            {s.notes.length === 0 && <Empty title="아직 작성된 메모가 없어요." />}
          </section>
        </div>
      )}

      <div className="row between wrap gap8" style={{ paddingTop: 8 }}>
        <span className="xs muted">학생을 삭제하면 시험 결과, 출결, 메모가 함께 삭제됩니다.</span>
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
            학생 삭제
          </button>
        )}
      </div>

      {editing && (
        <StudentFormModal
          initial={s}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            toast("학생 정보를 저장했어요");
            reload();
          }}
        />
      )}
    </div>
  );
}
