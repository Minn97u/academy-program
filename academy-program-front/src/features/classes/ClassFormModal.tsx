"use client";

import { useState } from "react";
import { api, ApiError } from "@/shared/api";
import { DOW } from "@/shared/lib/date";
import { GRADES } from "@/shared/lib/format";
import { useQuery } from "@/shared/lib/use-query";
import type { ClassInput, ClassRoom } from "@/shared/types/models";
import { Chips } from "@/shared/ui/controls";
import { Modal } from "@/shared/ui/Modal";

const EMPTY: ClassInput = { name: "", grade: "중2", teacherId: 0, days: [], startTime: "17:00", endTime: "18:30", description: "" };

/** 정규반 생성·수정 모달. initial이 있으면 수정. */
export function ClassFormModal({ initial, onClose, onSaved }: { initial?: ClassRoom; onClose: () => void; onSaved: (c: ClassRoom) => void }) {
  const teachers = useQuery(() => api.teachers.list(), []);
  const [form, setForm] = useState<ClassInput>(
    initial
      ? { name: initial.name, grade: initial.grade, teacherId: initial.teacherId, days: initial.days, startTime: initial.startTime, endTime: initial.endTime, description: initial.description }
      : EMPTY,
  );
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof ClassInput>(k: K, v: ClassInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const teacherId = form.teacherId || teachers.data?.[0]?.id || 0;

  const save = async () => {
    if (!form.name.trim()) return setErr("반 이름을 입력하세요.");
    if (!form.days.length) return setErr("수업 요일을 하나 이상 선택하세요.");
    if (form.startTime >= form.endTime) return setErr("종료 시간은 시작 시간보다 늦어야 합니다.");
    setSaving(true);
    try {
      const payload = { ...form, name: form.name.trim(), teacherId };
      onSaved(initial ? await api.classes.update(initial.id, payload) : await api.classes.create(payload));
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "저장에 실패했어요");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={initial ? "정규반 수정" : "새 정규반 만들기"}
      desc={initial ? "변경 내용은 즉시 반영됩니다" : "생성 후 정규반 목록에 바로 반영됩니다"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-g" onClick={onClose}>
            취소
          </button>
          <button type="button" className="btn btn-p" onClick={save} disabled={saving}>
            {initial ? "저장" : "정규반 생성"}
          </button>
        </>
      }
    >
      <div className="field">
        <label className="lab" htmlFor="mc-name">
          반 이름
        </label>
        <input id="mc-name" className="inp" placeholder="예: 중2 심화 C반" value={form.name} onChange={(e) => set("name", e.target.value)} />
      </div>
      <div className="field">
        <span className="lab">학년</span>
        <Chips value={form.grade} options={GRADES.map((g) => ({ value: g, label: g }))} onChange={(g) => set("grade", g)} />
      </div>
      <div className="field">
        <span className="lab">담당 선생님</span>
        <Chips value={teacherId} options={(teachers.data ?? []).map((t) => ({ value: t.id, label: t.name }))} onChange={(id) => set("teacherId", id)} />
      </div>
      <div className="field">
        <span className="lab">수업 요일</span>
        <Chips
          value={form.days}
          options={DOW.map((d, i) => ({ value: i, label: d }))}
          onChange={(d) => set("days", form.days.includes(d) ? form.days.filter((x) => x !== d) : [...form.days, d].sort())}
        />
      </div>
      <div className="row gap12">
        <div className="field grow">
          <label className="lab" htmlFor="mc-s">
            시작 시간
          </label>
          <input id="mc-s" className="inp" type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} />
        </div>
        <div className="field grow">
          <label className="lab" htmlFor="mc-e">
            종료 시간
          </label>
          <input id="mc-e" className="inp" type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label className="lab" htmlFor="mc-d">
          설명
        </label>
        <textarea id="mc-d" className="inp" style={{ minHeight: 72 }} placeholder="반의 학습 목표나 진도를 적어 주세요" value={form.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      {err && <span className="err-t">{err}</span>}
    </Modal>
  );
}
