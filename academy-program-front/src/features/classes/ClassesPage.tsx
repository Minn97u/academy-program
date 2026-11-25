"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHead } from "@/shared/ui/PageHead";
import { api } from "@/shared/api";
import { scheduleLabel } from "@/shared/lib/date";
import { useQuery } from "@/shared/lib/use-query";
import { Empty, ErrorBox, Loading, Seg } from "@/shared/ui/controls";
import { Icon } from "@/shared/ui/Icon";
import { useToast } from "@/shared/ui/toast";
import { ClassFormModal } from "./ClassFormModal";

export function ClassesPage() {
  const { data, loading, error, reload } = useQuery(() => api.classes.list(), []);
  const [view, setView] = useState<"card" | "table">("card");
  const [creating, setCreating] = useState(false);
  const toast = useToast();
  const items = data ?? [];

  return (
    <div className="page stack gap16">
      <PageHead title="정규반 관리" desc="담당 정규반의 일정과 학생 현황을 관리합니다." />
      <div className="row between wrap gap12">
        <div className="row gap8">
          <span className="b">정규반 {items.length}개</span>
        </div>
        <div className="row gap8">
          <Seg
            value={view}
            options={[
              { value: "card", label: "카드" },
              { value: "table", label: "표" },
            ]}
            onChange={setView}
          />
          <button type="button" className="btn btn-p" onClick={() => setCreating(true)}>
            <Icon name="plus" size="s" />새 반 만들기
          </button>
        </div>
      </div>
      {error && <ErrorBox message={error} />}
      {loading && <Loading />}
      {data && items.length === 0 && (
        <div className="card">
          <Empty
            title="아직 담당 정규반이 없어요"
            desc="새 반을 만들어 학생과 시험을 관리해 보세요."
            action={
              <button type="button" className="btn btn-p" onClick={() => setCreating(true)}>
                새 반 만들기
              </button>
            }
          />
        </div>
      )}

      {view === "card" && items.length > 0 && (
        <div className="g g-3">
          {items.map((c) => (
            <div key={c.id} className="card card-pad stack gap12">
              <div className="row between">
                <span className="bdg tag">{c.grade}</span>
                <span className="xs muted">{c.teacher.name} 선생님</span>
              </div>
              <div>
                <Link href={`/classes/${c.id}`} className="h2">
                  {c.name}
                </Link>
                <p className="xs muted ell" style={{ marginTop: 4 }}>
                  {c.description || "설명 없음"}
                </p>
              </div>
              <div className="row gap16 wrap" style={{ padding: "12px 0", borderTop: "1px solid #F2F2EF", borderBottom: "1px solid #F2F2EF" }}>
                <div className="stack">
                  <span className="xs muted">학생</span>
                  <span className="b num">{c.studentCount}명</span>
                </div>
                <div className="stack">
                  <span className="xs muted">등록 시험</span>
                  <span className="b num">{c.examCount}회</span>
                </div>
              </div>
              <div className="row gap6 xs muted">
                <Icon name="clock" size="s" />
                {scheduleLabel(c)}
              </div>
              <div className="row gap8">
                <Link href={`/classes/${c.id}`} className="btn btn-s btn-sm grow">
                  상세 보기
                </Link>
                <Link href="/attendance" className="btn btn-g btn-sm">
                  출석 체크
                </Link>
                <Link href={`/exams/new?classId=${c.id}`} className="btn btn-g btn-sm">
                  시험 등록
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "table" && items.length > 0 && (
        <section className="card tbl-wrap">
          <div className="th c-cls">
            <span>반 이름</span>
            <span>학년</span>
            <span>담당 선생님</span>
            <span>학생 수</span>
            <span>수업 일정</span>
            <span>등록 시험</span>
            <span>관리</span>
          </div>
          {items.map((c) => (
            <div key={c.id} className="tr c-cls">
              <Link href={`/classes/${c.id}`} className="b link-b">
                {c.name}
              </Link>
              <span>{c.grade}</span>
              <span>{c.teacher.name}</span>
              <span className="num">{c.studentCount}명</span>
              <span className="muted small">{scheduleLabel(c)}</span>
              <span className="num">{c.examCount}회</span>
              <span className="row gap4">
                <Link href={`/classes/${c.id}`} className="btn btn-s btn-sm">
                  상세
                </Link>
                <Link href="/attendance" className="btn btn-g btn-sm">
                  출석
                </Link>
              </span>
            </div>
          ))}
        </section>
      )}

      {creating && (
        <ClassFormModal
          onClose={() => setCreating(false)}
          onSaved={(c) => {
            setCreating(false);
            toast(`'${c.name}' 반을 만들었어요`);
            reload();
          }}
        />
      )}
    </div>
  );
}
