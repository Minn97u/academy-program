"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHead } from "@/features/shell/PageHead";
import { api } from "@/shared/api";
import { dot } from "@/shared/lib/date";
import { EXAM_TYPES, examStatus, score } from "@/shared/lib/format";
import { useQuery } from "@/shared/lib/use-query";
import type { ExamType } from "@/shared/types/models";
import { Dropdown, Empty, ErrorBox, Loading } from "@/shared/ui/controls";
import { Icon } from "@/shared/ui/Icon";

export function ExamsPage() {
  const [type, setType] = useState<ExamType | "all">("all");
  const [classId, setClassId] = useState(0);
  const [month, setMonth] = useState("all");
  const classes = useQuery(() => api.classes.list(), []);
  const exams = useQuery(() => api.exams.list(), []);

  const all = exams.data ?? [];
  const months = Array.from(new Set(all.map((e) => e.date.slice(0, 7)))).sort().reverse();
  const rows = all.filter((e) => (type === "all" || e.type === type) && (!classId || e.classId === classId) && (month === "all" || e.date.startsWith(month)));
  const hasFilter = type !== "all" || classId !== 0 || month !== "all";
  const reset = () => {
    setType("all");
    setClassId(0);
    setMonth("all");
  };

  return (
    <div className="page stack gap16">
      <PageHead title="시험 관리" desc="시험을 등록하고 학생별 결과를 입력합니다." />
      <section className="card card-pad row gap8 wrap" style={{ padding: "14px 16px" }}>
        <Dropdown
          value={type}
          onChange={setType}
          options={[{ value: "all" as const, label: "시험 유형 전체" }, ...(Object.keys(EXAM_TYPES) as ExamType[]).map((t) => ({ value: t, label: EXAM_TYPES[t].label }))]}
        />
        <Dropdown value={classId} onChange={setClassId} options={[{ value: 0, label: "정규반 전체" }, ...(classes.data ?? []).map((c) => ({ value: c.id, label: c.name }))]} />
        <Dropdown value={month} onChange={setMonth} options={[{ value: "all", label: "전체 기간" }, ...months.map((m) => ({ value: m, label: `${m.slice(0, 4)}년 ${Number(m.slice(5))}월` }))]} />
        {hasFilter && (
          <button type="button" className="btn btn-g btn-sm" onClick={reset}>
            필터 초기화
          </button>
        )}
        <div className="grow" />
        <span className="small muted">{rows.length}건</span>
        <Link href="/exams/new" className="btn btn-p">
          <Icon name="plus" size="s" />
          시험 등록
        </Link>
      </section>

      {exams.error && <ErrorBox message={exams.error} />}
      <section className="card tbl-wrap">
        <div className="th c-ex">
          <span>시험명</span>
          <span>시험 유형</span>
          <span>대상 정규반</span>
          <span>시험 날짜</span>
          <span>총점</span>
          <span>평균 점수</span>
          <span>응시</span>
          <span>입력 상태</span>
        </div>
        {exams.loading && <Loading />}
        {rows.map((x) => {
          const st = examStatus(x);
          return (
            <Link key={x.id} href={`/exams/${x.id}`} className="tr c-ex">
              <span className="row gap8">
                <span className="muted">
                  <Icon name="file" size="s" />
                </span>
                <span className="b ell">{x.name}</span>
              </span>
              <span className="small muted">{EXAM_TYPES[x.type].label}</span>
              <span className="small ell">{x.className}</span>
              <span className="muted num">{dot(x.date)}</span>
              <span className="num">{x.total}</span>
              <span className="b num">{score(x.avgScore)}</span>
              <span className="num">
                {x.enteredCount}/{x.participantCount}
              </span>
              <span>
                <span className={`bdg ${st.tone}`}>{st.label}</span>
              </span>
            </Link>
          );
        })}
        {exams.data && rows.length === 0 && (
          <Empty
            title={hasFilter ? "조건에 맞는 시험이 없어요" : "아직 등록된 시험이 없어요"}
            desc={hasFilter ? undefined : "첫 시험을 등록해 보세요!"}
            action={
              hasFilter ? (
                <button type="button" className="btn btn-s" onClick={reset}>
                  필터 초기화
                </button>
              ) : (
                <Link href="/exams/new" className="btn btn-p">
                  시험 등록
                </Link>
              )
            }
          />
        )}
      </section>
    </div>
  );
}
