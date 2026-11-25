"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHead } from "@/shared/ui/PageHead";
import { StudentFormModal } from "@/features/students/StudentFormModal";
import { StudentRow } from "@/features/students/StudentRow";
import { api, errorMessage } from "@/shared/api";
import { dot, scheduleLabel } from "@/shared/lib/date";
import { EXAM_TYPES, examStatus, pct, score } from "@/shared/lib/format";
import { useQuery } from "@/shared/lib/use-query";
import { Empty, ErrorBox, Loading, Tabs } from "@/shared/ui/controls";
import { useToast } from "@/shared/ui/toast";
import { ClassFormModal } from "./ClassFormModal";

type Tab = "students" | "exams" | "attendance";

export function ClassDetailPage({ id }: { id: number }) {
  const router = useRouter();
  const toast = useToast();
  const cls = useQuery(() => api.classes.get(id), [id]);
  const students = useQuery(() => api.students.list({ classId: id }), [id]);
  const exams = useQuery(() => api.exams.list({ classId: id }), [id]);
  const [tab, setTab] = useState<Tab>("students");
  const [modal, setModal] = useState<"edit" | "student" | "delete" | null>(null);
  const c = cls.data;

  if (cls.error) return <ErrorBox message={cls.error} />;
  if (!c) return <Loading />;

  const rows = students.data ?? [];
  const avg = rows.filter((s) => s.avgScore != null).map((s) => s.avgScore as number);
  const classAvg = avg.length ? Math.round((avg.reduce((a, b) => a + b, 0) / avg.length) * 10) / 10 : null;
  const att = rows.reduce((a, s) => ({ present: a.present + s.attendance.present, late: a.late + s.attendance.late, absent: a.absent + s.attendance.absent }), { present: 0, late: 0, absent: 0 });
  const attTotal = att.present + att.late + att.absent;
  const attRate = attTotal ? Math.round(((att.present + att.late) / attTotal) * 100) : null;

  const remove = async () => {
    try {
      await api.classes.remove(id);
      toast(`'${c.name}' 반을 삭제했어요`);
      router.push("/classes");
    } catch (e) {
      toast(errorMessage(e, "삭제에 실패했어요"));
    }
  };

  return (
    <div className="page stack gap20">
      <PageHead title={c.name} desc={[c.grade, `${c.teacher.name} 선생님`, scheduleLabel(c)]} back={{ href: "/classes", label: "정규반 관리" }} />
      <section className="card card-pad">
        <div className="row between wrap gap16">
          <div className="stack gap6">
            <div className="row gap8 wrap">
              <span className="bdg tag">{c.grade}</span>
              <span className="xs muted">{c.description}</span>
            </div>
            <h2 className="h2-l">{c.name}</h2>
          </div>
          <div className="row gap8 wrap">
            <button type="button" className="btn btn-g" onClick={() => setModal("edit")}>
              반 정보 수정
            </button>
            <button type="button" className="btn btn-s" onClick={() => setModal("student")}>
              학생 추가
            </button>
            <Link href="/attendance" className="btn btn-s">
              출석 체크
            </Link>
            <Link href={`/exams/new?classId=${c.id}`} className="btn btn-p">
              시험 등록
            </Link>
          </div>
        </div>
        <div className="meta-grid">
          <div className="meta">
            <span className="meta-l">담당 선생님</span>
            <span className="meta-v sm">{c.teacher.name}</span>
          </div>
          <div className="meta">
            <span className="meta-l">학생 수</span>
            <span className="meta-v num">
              {c.studentCount}
              <span className="kpi-u">명</span>
            </span>
          </div>
          <div className="meta">
            <span className="meta-l">수업 일정</span>
            <span className="meta-v sm">{scheduleLabel(c)}</span>
          </div>
          <div className="meta">
            <span className="meta-l">평균 성적</span>
            <span className="meta-v num">{score(classAvg)}</span>
          </div>
          <div className="meta">
            <span className="meta-l">누적 출석률</span>
            <span className="meta-v num">{pct(attRate)}</span>
          </div>
        </div>
      </section>

      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: "students", label: "학생 명단" },
          { value: "exams", label: "시험" },
          { value: "attendance", label: "출결" },
        ]}
      />

      {tab === "students" && (
        <section className="card tbl-wrap">
          {students.loading && <Loading />}
          {students.data?.length === 0 && (
            <Empty
              title="아직 등록된 학생이 없어요"
              action={
                <button type="button" className="btn btn-p" onClick={() => setModal("student")}>
                  학생 추가
                </button>
              }
            />
          )}
          {rows.length > 0 && (
            <>
              <div className="th c-cstu">
                <span>학생</span>
                <span>최근 점수</span>
                <span>평균</span>
                <span>직전 대비</span>
                <span>출석률</span>
              </div>
              {rows.map((s) => (
                <StudentRow key={s.id} s={s} cls="c-cstu" />
              ))}
            </>
          )}
        </section>
      )}

      {tab === "exams" && (
        <section className="card tbl-wrap">
          {exams.loading && <Loading />}
          {exams.data?.length === 0 && (
            <Empty
              title="아직 등록된 시험이 없어요"
              desc="첫 시험을 등록해 보세요!"
              action={
                <Link href={`/exams/new?classId=${c.id}`} className="btn btn-p">
                  시험 등록
                </Link>
              }
            />
          )}
          {(exams.data ?? []).length > 0 && (
            <>
              <div className="th c-cex">
                <span>시험명</span>
                <span>유형</span>
                <span>날짜</span>
                <span>응시</span>
                <span>평균</span>
                <span>입력 상태</span>
              </div>
              {(exams.data ?? []).map((x) => {
                const st = examStatus(x);
                return (
                  <Link key={x.id} href={`/exams/${x.id}`} className="tr c-cex">
                    <span className="b ell">{x.name}</span>
                    <span className="muted small">{EXAM_TYPES[x.type].label}</span>
                    <span className="muted num">{dot(x.date)}</span>
                    <span className="num">
                      {x.enteredCount}/{x.participantCount}
                    </span>
                    <span className="b num">{score(x.avgScore)}</span>
                    <span>
                      <span className={`bdg ${st.tone}`}>{st.label}</span>
                    </span>
                  </Link>
                );
              })}
            </>
          )}
        </section>
      )}

      {tab === "attendance" && (
        <section className="card tbl-wrap">
          <div className="card-h card-hp">
            <div>
              <h3 className="card-t">학생별 출결 현황</h3>
              <p className="card-s">누적 기준이며 출석률은 (출석+지각) / 체크한 수업일입니다</p>
            </div>
            <Link href="/attendance" className="btn btn-p btn-sm">
              출석 체크하기
            </Link>
          </div>
          <div className="th c-catt">
            <span>학생</span>
            <span>출석</span>
            <span>지각</span>
            <span>결석</span>
            <span>출석률</span>
          </div>
          {rows.map((s) => (
            <Link key={s.id} href={`/students/${s.id}`} className="tr c-catt">
              <span className="b">{s.name}</span>
              <span className="num">{s.attendance.present}</span>
              <span className="num">{s.attendance.late}</span>
              <span className="num">{s.attendance.absent}</span>
              <span className="b num">{pct(s.attendance.rate)}</span>
            </Link>
          ))}
          {rows.length === 0 && <Empty title="학생이 없어요" />}
        </section>
      )}

      <div className="row between wrap gap8" style={{ paddingTop: 8 }}>
        <span className="xs muted">반을 삭제하면 시험과 출결 기록도 함께 삭제되고, 학생은 미배정 상태로 남습니다.</span>
        {modal === "delete" ? (
          <div className="row gap6">
            <button type="button" className="btn btn-g btn-sm" onClick={() => setModal(null)}>
              취소
            </button>
            <button type="button" className="btn btn-d btn-sm" onClick={remove}>
              삭제 실행
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-d btn-sm" onClick={() => setModal("delete")}>
            반 삭제
          </button>
        )}
      </div>

      {modal === "edit" && (
        <ClassFormModal
          initial={c}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            toast("반 정보를 저장했어요");
            cls.reload();
          }}
        />
      )}
      {modal === "student" && (
        <StudentFormModal
          defaultClass={{ id: c.id, grade: c.grade }}
          onClose={() => setModal(null)}
          onSaved={(s) => {
            setModal(null);
            toast(`'${s.name}' 학생을 등록했어요`);
            students.reload();
            cls.reload();
          }}
        />
      )}
    </div>
  );
}
