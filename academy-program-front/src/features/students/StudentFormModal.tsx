"use client";

import { useState } from "react";
import { api, ApiError } from "@/shared/api";
import { GRADES } from "@/shared/lib/format";
import { useQuery } from "@/shared/lib/use-query";
import type { Student, StudentInput } from "@/shared/types/models";
import { Chips } from "@/shared/ui/controls";
import { Modal } from "@/shared/ui/Modal";

/** 학생 등록·수정 모달. initial이 있으면 수정, defaultClass는 반 상세에서 열 때 미리 선택. */
export function StudentFormModal({
  initial,
  defaultClass,
  onClose,
  onSaved,
}: {
  initial?: Student;
  defaultClass?: { id: number; grade: string };
  onClose: () => void;
  onSaved: (s: Student) => void;
}) {
  const classes = useQuery(() => api.classes.list(), []);
  const [form, setForm] = useState<StudentInput>(
    initial
      ? { name: initial.name, grade: initial.grade, classId: initial.classId, phone: initial.phone, memo: initial.memo }
      : { name: "", grade: defaultClass?.grade ?? "중2", classId: defaultClass?.id ?? null, phone: "", memo: "" },
  );
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof StudentInput>(k: K, v: StudentInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const classOptions = (classes.data ?? []).filter((c) => c.grade === form.grade);

  const save = async () => {
    if (!form.name.trim()) return setErr("학생 이름을 입력하세요.");
    setSaving(true);
    try {
      const payload = { ...form, name: form.name.trim() };
      onSaved(initial ? await api.students.update(initial.id, payload) : await api.students.create(payload));
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "저장에 실패했어요");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={initial ? "학생 정보 수정" : "학생 등록"}
      desc={initial ? "변경 내용은 즉시 반영됩니다" : "등록일 이후 시험부터 응시 대상에 포함됩니다"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-g" onClick={onClose}>
            취소
          </button>
          <button type="button" className="btn btn-p" onClick={save} disabled={saving}>
            {initial ? "저장" : "학생 등록"}
          </button>
        </>
      }
    >
      <div className="field">
        <label className="lab" htmlFor="ms-name">
          이름
        </label>
        <input id="ms-name" className="inp" placeholder="학생 이름" value={form.name} onChange={(e) => set("name", e.target.value)} />
      </div>
      <div className="field">
        <span className="lab">학년</span>
        <Chips
          value={form.grade}
          options={GRADES.map((g) => ({ value: g, label: g }))}
          onChange={(g) => {
            set("grade", g);
            set("classId", null);
          }}
        />
      </div>
      <div className="field">
        <span className="lab">소속 정규반</span>
        <Chips
          value={form.classId ?? 0}
          options={[{ value: 0, label: "미배정" }, ...classOptions.map((c) => ({ value: c.id, label: c.name }))]}
          onChange={(id) => set("classId", id || null)}
        />
        {classes.data && classOptions.length === 0 && (
          <span className="xs muted" style={{ marginTop: 6 }}>
            선택한 학년의 정규반이 없어요. 먼저 정규반을 만들어 주세요.
          </span>
        )}
      </div>
      <div className="field">
        <label className="lab" htmlFor="ms-ph">
          보호자 연락처 <span className="muted">(선택)</span>
        </label>
        <input id="ms-ph" className="inp" placeholder="010-0000-0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
      </div>
      <div className="field">
        <label className="lab" htmlFor="ms-m">
          메모 <span className="muted">(선택)</span>
        </label>
        <textarea id="ms-m" className="inp" style={{ minHeight: 72 }} placeholder="첫 상담 내용, 학습 수준 등" value={form.memo} onChange={(e) => set("memo", e.target.value)} />
      </div>
      {err && <span className="err-t">{err}</span>}
    </Modal>
  );
}
