"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHead } from "@/features/shell/PageHead";
import { api, ApiError } from "@/shared/api";
import { DOW, addDays, addMonths, fullDate, monthCells, monthLabel } from "@/shared/lib/date";
import { ATT_LABEL } from "@/shared/lib/format";
import { useQuery } from "@/shared/lib/use-query";
import { useToday } from "@/shared/lib/use-today";
import type { AttendanceStatus } from "@/shared/types/models";
import { Dropdown, ErrorBox, Loading } from "@/shared/ui/controls";
import { Icon } from "@/shared/ui/Icon";
import { useToast } from "@/shared/ui/toast";

const STATUSES: { key: AttendanceStatus; cls: string }[] = [
  { key: "PRESENT", cls: "present" },
  { key: "LATE", cls: "late" },
  { key: "ABSENT", cls: "absent" },
];

export function AttendancePage() {
  const today = useToday();
  return today ? <Board today={today} /> : <Loading />;
}

function Board({ today }: { today: string }) {
  const toast = useToast();
  const [date, setDate] = useState(today);
  const [classId, setClassId] = useState(0);
  const [calMonth, setCalMonth] = useState(today.slice(0, 7));
  const classes = useQuery(() => api.classes.list(), []);
  const sheets = useQuery(() => api.attendance.byDate(date, classId || undefined), [date, classId]);
  const cal = useQuery(() => api.attendance.calendar(calMonth, classId || undefined), [calMonth, classId]);

  const rows = (sheets.data ?? []).flatMap((sh) => sh.students.map((s) => ({ ...s, classId: sh.classId, className: sh.className })));
  const count = (st: AttendanceStatus) => rows.filter((r) => r.status === st).length;
  const unchecked = rows.filter((r) => !r.status).length;
  const calCount = new Map((cal.data ?? []).map((c) => [c.date, c.count]));
  const offSheet = classId ? sheets.data?.[0] && !sheets.data[0].meetsToday : false;

  const save = async (r: (typeof rows)[number], status: AttendanceStatus, memo?: string) => {
    try {
      await api.attendance.save({ classId: r.classId, studentId: r.id, date, status, memo: memo ?? r.memo });
      sheets.reload();
      cal.reload();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "저장에 실패했어요");
    }
  };
  const clear = async (r: (typeof rows)[number]) => {
    await api.attendance.remove(r.id, date);
    sheets.reload();
    cal.reload();
  };
  const allPresent = async () => {
    const targets = rows.filter((r) => !r.status);
    await Promise.all(targets.map((r) => api.attendance.save({ classId: r.classId, studentId: r.id, date, status: "PRESENT", memo: r.memo })));
    toast(`${targets.length}명을 출석으로 체크했어요`);
    sheets.reload();
    cal.reload();
  };
  const pickDate = (d: string) => {
    setDate(d);
    setCalMonth(d.slice(0, 7));
  };

  return (
    <div className="page stack gap20">
      <PageHead title="출결 관리" desc="날짜와 반을 선택해 출석을 체크합니다." />
      <section className="card card-pad row gap8 wrap" style={{ padding: "14px 16px" }}>
        <button type="button" className="btn btn-s btn-sm btn-icon" onClick={() => pickDate(addDays(date, -1))} aria-label="이전 날짜">
          <Icon name="chevL" size="s" />
        </button>
        <input className="inp" type="date" style={{ width: 170, height: 36 }} value={date} onChange={(e) => e.target.value && pickDate(e.target.value)} aria-label="날짜 선택" />
        <button type="button" className="btn btn-s btn-sm btn-icon" onClick={() => pickDate(addDays(date, 1))} aria-label="다음 날짜">
          <Icon name="chevR" size="s" />
        </button>
        <button type="button" className="btn btn-g btn-sm" onClick={() => pickDate(today)}>
          오늘
        </button>
        <Dropdown value={classId} onChange={setClassId} options={[{ value: 0, label: "오늘 수업 있는 반 전체" }, ...(classes.data ?? []).map((c) => ({ value: c.id, label: c.name }))]} />
        <div className="grow" />
        <span className="small b">{fullDate(date)}</span>
      </section>

      <div className="g" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(150px, 100%), 1fr))" }}>
        <div className="card mini">
          <span className="xs muted">대상 학생</span>
          <span className="mini-v num">{rows.length}명</span>
        </div>
        {STATUSES.map((s) => (
          <div key={s.key} className="card mini">
            <span className="xs muted">{ATT_LABEL[s.key]}</span>
            <span className="mini-v num">{count(s.key)}명</span>
          </div>
        ))}
        <div className="card mini">
          <span className="xs muted">미체크</span>
          <span className="mini-v num">{unchecked}명</span>
        </div>
      </div>

      {offSheet && (
        <div className="notice n-info">
          <Icon name="info" />
          <div>이 반은 선택한 날짜에 정규 수업이 없어요. 보충 수업 등 필요하면 그대로 체크할 수 있습니다.</div>
        </div>
      )}
      {sheets.error && <ErrorBox message={sheets.error} />}

      <div className="g g-main">
        <section className="card">
          <div className="card-h card-hp">
            <div>
              <h3 className="card-t">출석 체크</h3>
              <p className="card-s">상태를 누르면 바로 저장돼요</p>
            </div>
            <button type="button" className="btn btn-s btn-sm" onClick={allPresent} disabled={unchecked === 0}>
              미체크 전원 출석
            </button>
          </div>
          <div className="tbl-wrap">
            <div className="th c-att">
              <span>학생 이름</span>
              <span>정규반</span>
              <span>출석 상태</span>
              <span>비고</span>
            </div>
            {sheets.loading && <Loading />}
            {rows.map((r) => (
              <div key={`${r.classId}-${r.id}`} className="tr c-att">
                <Link href={`/students/${r.id}`} className="b">
                  {r.name}
                </Link>
                <span className="small muted ell">{r.className}</span>
                <div className="att-seg">
                  {STATUSES.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      className={`att-b${r.status === s.key ? ` ${s.cls}` : ""}`}
                      onClick={() => (r.status === s.key ? clear(r) : save(r, s.key))}
                      aria-pressed={r.status === s.key}
                    >
                      {ATT_LABEL[s.key]}
                    </button>
                  ))}
                </div>
                <input
                  className="inp"
                  style={{ height: 34 }}
                  placeholder="비고"
                  defaultValue={r.memo}
                  disabled={!r.status}
                  onBlur={(e) => r.status && e.target.value !== r.memo && save(r, r.status, e.target.value)}
                  aria-label="비고"
                />
              </div>
            ))}
            {sheets.data && rows.length === 0 && (
              <div className="empty">
                <p className="empty-t">이 날짜에 예정된 수업이 없어요</p>
                <p className="small muted">다른 날짜나 정규반을 선택해 보세요.</p>
              </div>
            )}
          </div>
        </section>

        <section className="card card-pad">
          <div className="card-h">
            <div>
              <h3 className="card-t">{monthLabel(calMonth)}</h3>
              <p className="card-s">날짜를 선택하면 해당 날짜의 출석부가 열려요</p>
            </div>
            <div className="row gap6">
              <button type="button" className="btn btn-s btn-sm btn-icon" onClick={() => setCalMonth(addMonths(calMonth, -1))} aria-label="이전 달">
                <Icon name="chevL" size="s" />
              </button>
              <button type="button" className="btn btn-s btn-sm btn-icon" onClick={() => setCalMonth(addMonths(calMonth, 1))} aria-label="다음 달">
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
            {monthCells(calMonth).map((d, i) => {
              if (!d) return <div key={`b${i}`} className="cal-c blank" />;
              const n = calCount.get(d);
              return (
                <button key={d} type="button" className={`cal-c${d === date ? " sel" : ""}${d === today ? " today" : ""}${n ? "" : " off"}`} onClick={() => pickDate(d)}>
                  <span className="cal-d">{Number(d.slice(8))}</span>
                  {n ? <span className="cal-s t-ok">{n}명 체크</span> : null}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
