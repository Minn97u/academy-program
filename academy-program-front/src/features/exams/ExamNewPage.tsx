"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHead } from "@/features/shell/PageHead";
import { api, ApiError } from "@/shared/api";
import { dot } from "@/shared/lib/date";
import { EXAM_TYPES } from "@/shared/lib/format";
import { useQuery } from "@/shared/lib/use-query";
import { useToday } from "@/shared/lib/use-today";
import type { Exam, ExamInput, ExamType } from "@/shared/types/models";
import { Dropdown, Loading } from "@/shared/ui/controls";
import { Icon } from "@/shared/ui/Icon";

const STEPS = ["기본 정보", "등록 완료"];

/** 시험 등록. 목업의 2단계(시험 자료 업로드)는 AI 분석용이므로 제외했다. */
export function ExamNewPage({ classId }: { classId?: number }) {
  const today = useToday();
  return today ? <Wizard classId={classId} today={today} /> : <Loading />;
}

function Wizard({ classId, today }: { classId?: number; today: string }) {
  const classes = useQuery(() => api.classes.list(), []);
  const [form, setForm] = useState<ExamInput>({ name: "", type: "ACADEMY", classId: classId ?? 0, date: today, total: 100, questionCount: 20 });
  const [err, setErr] = useState<Partial<Record<keyof ExamInput, string>> & { submit?: string }>({});
  const [created, setCreated] = useState<Exam | null>(null);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof ExamInput>(k: K, v: ExamInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    const e: typeof err = {};
    if (!form.name.trim()) e.name = "시험명을 입력하세요.";
    if (!form.classId) e.classId = "대상 반을 선택하세요.";
    if (!form.date) e.date = "시험 날짜를 입력하세요.";
    if (!(form.total >= 1)) e.total = "총점은 1 이상이어야 합니다.";
    if (!(form.questionCount >= 1)) e.questionCount = "문항 수는 1 이상이어야 합니다.";
    setErr(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      setCreated(await api.exams.create({ ...form, name: form.name.trim() }));
    } catch (x) {
      setErr({ submit: x instanceof ApiError ? x.message : "등록에 실패했어요" });
    } finally {
      setSaving(false);
    }
  };

  const step = created ? 1 : 0;
  const cls = classes.data?.find((c) => c.id === form.classId);

  return (
    <div className="page stack gap20" style={{ maxWidth: 920, margin: "0 auto", width: "100%" }}>
      <PageHead title="시험 등록" desc="기본 정보를 입력하면 바로 성적을 입력할 수 있어요." back={{ href: "/exams", label: "시험 관리" }} />
      <div className="stepper">
        {STEPS.map((label, i) => (
          <div key={label} className="row gap8">
            <div className={`step${i === step ? " on" : i < step ? " done" : ""}`}>
              <span className="step-n">{i + 1}</span>
              {label}
            </div>
            {i < STEPS.length - 1 && <span className="step-line" />}
          </div>
        ))}
      </div>

      {!created && (
        <>
          <section className="card card-pad stack gap20">
            <div>
              <h3 className="h2">기본 정보</h3>
              <p className="card-s">시험명과 대상 반, 총점과 문항 수를 입력하세요.</p>
            </div>
            <div className="field">
              <label className="lab" htmlFor="wz-name">
                시험명
              </label>
              <input id="wz-name" className="inp" placeholder="예: 11월 3주차 정기 테스트" value={form.name} onChange={(e) => set("name", e.target.value)} />
              {err.name && <span className="err-t">{err.name}</span>}
            </div>
            <div className="field">
              <span className="lab">시험 유형</span>
              <div className="g" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(190px, 100%), 1fr))", gap: 10 }}>
                {(Object.keys(EXAM_TYPES) as ExamType[]).map((t) => (
                  <button key={t} type="button" className={`tcard${form.type === t ? " on" : ""}`} onClick={() => set("type", t)}>
                    <span className="b">{EXAM_TYPES[t].label}</span>
                    <span className="xs muted">{EXAM_TYPES[t].desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="g" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 16 }}>
              <div className="field">
                <span className="lab">대상 반</span>
                <Dropdown full value={form.classId} onChange={(v) => set("classId", v)} options={[{ value: 0, label: "반 선택" }, ...(classes.data ?? []).map((c) => ({ value: c.id, label: c.name }))]} />
                {err.classId && <span className="err-t">{err.classId}</span>}
              </div>
              <div className="field">
                <label className="lab" htmlFor="wz-date">
                  시험 날짜
                </label>
                <input id="wz-date" className="inp" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
                {err.date && <span className="err-t">{err.date}</span>}
              </div>
              <div className="field">
                <label className="lab" htmlFor="wz-total">
                  총점
                </label>
                <input id="wz-total" className="inp" type="number" min={1} value={form.total} onChange={(e) => set("total", Number(e.target.value))} />
                {err.total && <span className="err-t">{err.total}</span>}
              </div>
              <div className="field">
                <label className="lab" htmlFor="wz-q">
                  문항 수
                </label>
                <input id="wz-q" className="inp" type="number" min={1} value={form.questionCount} onChange={(e) => set("questionCount", Number(e.target.value))} />
                {err.questionCount && <span className="err-t">{err.questionCount}</span>}
              </div>
            </div>
            {err.submit && <span className="err-t">{err.submit}</span>}
          </section>
          <div className="row between">
            <Link href="/exams" className="btn btn-g">
              취소
            </Link>
            <button type="button" className="btn btn-p" onClick={submit} disabled={saving}>
              시험 등록
              <Icon name="chevR" size="s" />
            </button>
          </div>
        </>
      )}

      {created && (
        <section className="card card-pad stack gap20" style={{ alignItems: "center", textAlign: "center" }}>
          <span className="done-ic">
            <Icon name="check" size="l" />
          </span>
          <div>
            <h3 className="h2">시험이 등록되었어요!</h3>
            <p className="small muted" style={{ marginTop: 4 }}>
              이제 학생별 점수와 오답 문항을 입력할 차례예요.
            </p>
          </div>
          <div className="stack" style={{ width: "min(480px, 100%)", textAlign: "left", border: "1px solid #EFEFEC", borderRadius: 14, padding: "6px 18px" }}>
            {[
              ["시험명", created.name],
              ["시험 유형", EXAM_TYPES[created.type].label],
              ["대상 반", cls?.name ?? created.className],
              ["시험 날짜", dot(created.date)],
              ["총점 / 문항 수", `${created.total}점 / ${created.questionCount}문항`],
              ["응시 대상", `${created.participantCount}명`],
            ].map(([k, v]) => (
              <div key={k} className="row between gap12 small" style={{ padding: "10px 0", borderBottom: "1px solid #F3F3F0" }}>
                <span className="muted">{k}</span>
                <span className="b" style={{ textAlign: "right" }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
          <div className="row gap8 wrap" style={{ justifyContent: "center" }}>
            <Link href={`/exams/${created.id}`} className="btn btn-p">
              성적 입력하기
            </Link>
            <Link href="/exams" className="btn btn-g">
              시험 목록으로
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
