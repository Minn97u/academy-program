"use client";

import { useState } from "react";
import { PageHead } from "@/shared/ui/PageHead";
import { api } from "@/shared/api";
import { GRADES } from "@/shared/lib/format";
import { useQuery } from "@/shared/lib/use-query";
import { Dropdown, Empty, ErrorBox, Loading } from "@/shared/ui/controls";
import { Icon } from "@/shared/ui/Icon";
import { useToast } from "@/shared/ui/toast";
import { StudentFormModal } from "./StudentFormModal";
import { StudentRow } from "./StudentRow";

export function StudentsPage() {
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState("all");
  const [classId, setClassId] = useState(0);
  const [creating, setCreating] = useState(false);
  const toast = useToast();
  const classes = useQuery(() => api.classes.list(), []);
  const students = useQuery(() => api.students.list(), []);

  const rows = (students.data ?? []).filter(
    (s) => (!q.trim() || s.name.includes(q.trim())) && (grade === "all" || s.grade === grade) && (!classId || s.classId === classId),
  );
  const hasFilter = !!q || grade !== "all" || classId !== 0;
  // 학년을 바꾸면 그 학년에 없는 반 필터는 함께 푼다.
  const pickGrade = (g: string) => {
    setGrade(g);
    if (g !== "all" && classes.data?.find((c) => c.id === classId)?.grade !== g) setClassId(0);
  };
  const reset = () => {
    setQ("");
    setGrade("all");
    setClassId(0);
  };

  return (
    <div className="page stack gap16">
      <PageHead title="학생 관리" desc="학생별 성적과 출결 상태를 확인합니다." />
      <section className="card card-pad row gap8 wrap" style={{ padding: "14px 16px" }}>
        <div style={{ position: "relative", width: "min(260px, 100%)" }}>
          <span style={{ position: "absolute", left: 12, top: 12, color: "#71717A" }}>
            <Icon name="search" size="s" />
          </span>
          <input className="inp" style={{ paddingLeft: 36 }} placeholder="학생 이름 검색" value={q} onChange={(e) => setQ(e.target.value)} aria-label="학생 이름 검색" />
        </div>
        <Dropdown value={grade} onChange={pickGrade} options={[{ value: "all", label: "학년 전체" }, ...GRADES.map((g) => ({ value: g, label: g }))]} />
        <Dropdown
          value={classId}
          onChange={setClassId}
          options={[{ value: 0, label: "정규반 전체" }, ...(classes.data ?? []).filter((c) => grade === "all" || c.grade === grade).map((c) => ({ value: c.id, label: c.name }))]}
        />
        {hasFilter && (
          <button type="button" className="btn btn-g btn-sm" onClick={reset}>
            필터 초기화
          </button>
        )}
        <div className="grow" />
        <span className="small muted">{rows.length}명 표시</span>
        <button type="button" className="btn btn-p" onClick={() => setCreating(true)}>
          <Icon name="plus" size="s" />
          학생 등록
        </button>
      </section>

      {students.error && <ErrorBox message={students.error} />}
      <section className="card tbl-wrap">
        <div className="th c-stu">
          <span>학생 이름</span>
          <span>학년</span>
          <span>소속 정규반</span>
          <span>최근 점수</span>
          <span>평균 점수</span>
          <span>직전 대비</span>
          <span>출석률</span>
          <span>응시 기록</span>
        </div>
        {students.loading && <Loading />}
        {rows.map((s) => (
          <StudentRow key={s.id} s={s} cls="c-stu" />
        ))}
        {students.data && rows.length === 0 && (
          <Empty
            title={hasFilter ? "조건에 맞는 학생이 없어요" : "아직 등록된 학생이 없어요"}
            action={
              hasFilter ? (
                <button type="button" className="btn btn-s" onClick={reset}>
                  필터 초기화
                </button>
              ) : (
                <button type="button" className="btn btn-p" onClick={() => setCreating(true)}>
                  학생 등록
                </button>
              )
            }
          />
        )}
      </section>

      {creating && (
        <StudentFormModal
          onClose={() => setCreating(false)}
          onSaved={(s) => {
            setCreating(false);
            toast(`'${s.name}' 학생을 등록했어요`);
            students.reload();
          }}
        />
      )}
    </div>
  );
}
