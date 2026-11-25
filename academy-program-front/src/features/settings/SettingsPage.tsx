"use client";

import { useState } from "react";
import { PageHead } from "@/shared/ui/PageHead";
import { api, ApiError } from "@/shared/api";
import { useSettings } from "@/shared/lib/settings";
import type { Settings } from "@/shared/types/models";
import { ErrorBox, Loading } from "@/shared/ui/controls";
import { useToast } from "@/shared/ui/toast";

export function SettingsPage() {
  const { data, error, reload } = useSettings();
  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;
  // 저장된 값이 바뀔 때마다 폼을 다시 초기화한다.
  return <SettingsForm key={`${data.teacher.name}|${data.academyName}`} data={data} onSaved={reload} />;
}

function SettingsForm({ data, onSaved }: { data: Settings; onSaved: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({ teacherName: data.teacher.name, academyName: data.academyName });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const dirty = form.teacherName !== data.teacher.name || form.academyName !== data.academyName;
  const save = async () => {
    if (!form.teacherName.trim() || !form.academyName.trim()) return setErr("이름과 학원 이름을 모두 입력하세요.");
    setSaving(true);
    setErr("");
    try {
      await api.settings.update({ teacherName: form.teacherName.trim(), academyName: form.academyName.trim() });
      toast("설정을 저장했어요");
      onSaved();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "저장에 실패했어요");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page stack gap20" style={{ maxWidth: 860 }}>
      <PageHead title="설정" desc="프로필과 학원 정보를 관리합니다." />
      <section className="card card-pad">
        <h3 className="card-t">프로필</h3>
        <div className="set-row">
          <div className="field grow" style={{ minWidth: 220 }}>
            <label className="lab" htmlFor="set-name">
              선생님 이름
            </label>
            <input id="set-name" className="inp" value={form.teacherName} onChange={(e) => setForm({ ...form, teacherName: e.target.value })} />
          </div>
          <div className="field grow" style={{ minWidth: 220 }}>
            <label className="lab" htmlFor="set-ac">
              학원 이름
            </label>
            <input id="set-ac" className="inp" value={form.academyName} onChange={(e) => setForm({ ...form, academyName: e.target.value })} />
          </div>
        </div>
        {err && <span className="err-t">{err}</span>}
        <div className="row between" style={{ marginTop: 8 }}>
          <span className="xs muted">사이드바와 인사말에 바로 반영됩니다.</span>
          <button type="button" className="btn btn-p" onClick={save} disabled={!dirty || saving}>
            저장
          </button>
        </div>
      </section>
      <section className="card card-pad">
        <h3 className="card-t">데이터</h3>
        <div className="set-row">
          <div className="stack grow">
            <span className="b small">저장 위치</span>
            <span className="xs muted">PostgreSQL 데이터베이스에 저장됩니다. 반·학생·시험·출결 데이터는 각 화면에서 직접 수정하거나 삭제할 수 있어요.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
