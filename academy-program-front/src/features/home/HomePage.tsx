"use client";

import Link from "next/link";
import { PageHead } from "@/shared/ui/PageHead";
import { api } from "@/shared/api";
import { dayOfWeek, dot, fullDate } from "@/shared/lib/date";
import { examStatus, score } from "@/shared/lib/format";
import { useQuery } from "@/shared/lib/use-query";
import { useToday } from "@/shared/lib/use-today";
import { Empty, ErrorBox, Loading } from "@/shared/ui/controls";
import { Icon } from "@/shared/ui/Icon";

export function HomePage() {
  const TODAY = useToday();
  return TODAY ? <Dashboard TODAY={TODAY} /> : <Loading />;
}

function Dashboard({ TODAY }: { TODAY: string }) {
  const classes = useQuery(() => api.classes.list(), []);
  const students = useQuery(() => api.students.list(), []);
  const exams = useQuery(() => api.exams.list(), []);
  const sheets = useQuery(() => api.attendance.byDate(TODAY), [TODAY]);

  const todayClasses = (classes.data ?? []).filter((c) => c.days.includes(dayOfWeek(TODAY))).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const checked = new Set((sheets.data ?? []).filter((s) => s.students.some((x) => x.status)).map((s) => s.classId));
  const pendingAtt = todayClasses.filter((c) => !checked.has(c.id)).length;
  const inputting = (exams.data ?? []).filter((e) => e.enteredCount < e.participantCount).length;
  const monthExams = (exams.data ?? []).filter((e) => e.date.slice(0, 7) === TODAY.slice(0, 7)).length;

  const kpis = [
    { label: "담당 정규반", value: classes.data?.length ?? "—", unit: "개", sub: "정규반 관리", href: "/classes" },
    { label: "전체 학생", value: students.data?.length ?? "—", unit: "명", sub: "학생 관리", href: "/students" },
    { label: "이번 달 시험", value: exams.data ? monthExams : "—", unit: "회", sub: `성적 입력 중 ${inputting}건`, href: "/exams" },
    { label: "오늘 수업", value: classes.data ? todayClasses.length : "—", unit: "개", sub: `출석 체크 미완료 ${pendingAtt}개 반`, href: "/attendance" },
  ];
  const err = classes.error ?? students.error ?? exams.error;

  return (
    <div className="page stack gap20">
      <PageHead
        title="홈"
        desc="오늘의 학원 운영 현황을 확인하세요."
        action={
          <Link href="/exams/new" className="btn btn-p">
            <Icon name="plus" size="s" />
            시험 등록
          </Link>
        }
      />
      {err && <ErrorBox message={`${err} — 백엔드(localhost:4200)가 실행 중인지 확인하세요.`} />}

      <section className="card welcome">
        <div className="stack gap8 grow">
          <h2 className="welcome-t">오늘 확인할 일</h2>
          <p className="muted">수업 전에 출석 체크와 성적 입력 상태를 먼저 확인해 보세요.</p>
          <div className="row gap8 wrap" style={{ marginTop: 6 }}>
            <Link href="/attendance" className="chip">
              오늘 수업 {todayClasses.length}개
            </Link>
            <Link href="/exams" className="chip">
              성적 입력 중 {inputting}건
            </Link>
            <Link href="/attendance" className="chip">
              출석 체크 미완료 {pendingAtt}개 반
            </Link>
          </div>
        </div>
      </section>

      <div className="card kpi-strip">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="kpi">
            <span className="kpi-l">{k.label}</span>
            <div className="row gap4" style={{ alignItems: "baseline" }}>
              <span className="kpi-v num">{k.value}</span>
              <span className="kpi-u">{k.unit}</span>
            </div>
            <div className="row gap6 xs wrap">
              <span className="muted">{k.sub}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="g g-main2">
        <section className="card card-pad">
          <div className="card-h">
            <div>
              <h3 className="card-t">오늘의 수업</h3>
              <p className="card-s">{fullDate(TODAY)}</p>
            </div>
            <Link href="/attendance" className="btn btn-g btn-sm">
              출결 관리
            </Link>
          </div>
          {classes.loading && <Loading />}
          {classes.data && todayClasses.length === 0 && <Empty title="오늘 예정된 수업이 없어요." />}
          {todayClasses.map((c) => (
            <div key={c.id} className="today-row">
              <div className="time">
                <b className="num">{c.startTime}</b>
                <span className="num">{c.endTime}</span>
              </div>
              <div className="grow">
                <Link href={`/classes/${c.id}`} className="b small">
                  {c.name}
                </Link>
                <div className="xs muted meta-row">
                  <span>{c.teacher.name} 선생님</span>
                  <span>학생 {c.studentCount}명</span>
                </div>
              </div>
              <span className={`bdg ${checked.has(c.id) ? "t-ok" : "t-warn"}`}>{checked.has(c.id) ? "출석 체크 완료" : "출석 체크 전"}</span>
              <Link href="/attendance" className="btn btn-s btn-sm">
                출석 관리
              </Link>
            </div>
          ))}
        </section>

        <section className="card">
          <div className="card-h card-hp">
            <div>
              <h3 className="card-t">최근 시험</h3>
              <p className="card-s">시험을 선택하면 상세 화면으로 이동합니다</p>
            </div>
            <Link href="/exams" className="btn btn-g btn-sm">
              전체 보기
            </Link>
          </div>
          <div className="tbl-wrap">
            <div className="th c-home-ex">
              <span>시험명</span>
              <span>대상 반</span>
              <span>날짜</span>
              <span>응시</span>
              <span>평균</span>
              <span>입력 상태</span>
            </div>
            {exams.loading && <Loading />}
            {exams.data?.length === 0 && <Empty title="아직 등록된 시험이 없어요" />}
            {(exams.data ?? []).slice(0, 6).map((x) => {
              const st = examStatus(x);
              return (
                <Link key={x.id} href={`/exams/${x.id}`} className="tr c-home-ex">
                  <span className="b ell">{x.name}</span>
                  <span className="muted ell">{x.className}</span>
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
          </div>
        </section>
      </div>
    </div>
  );
}
