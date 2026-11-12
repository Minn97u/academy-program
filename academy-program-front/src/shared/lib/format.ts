import type { AttendanceStatus, Exam, ExamType, ResultStatus } from "@/shared/types/models";

export const GRADES = ["중1", "중2", "중3", "고1", "고2"];
export const NOTE_KINDS = ["상담", "학습", "학부모 연락"];

export const EXAM_TYPES: Record<ExamType, { label: string; desc: string }> = {
  ACADEMY: { label: "학원 정기 테스트", desc: "원본 시험지가 있는 학원 자체 평가" },
  SCHOOL: { label: "학교 시험", desc: "중간고사, 기말고사 등 학교 내신 시험" },
  MOCK: { label: "전국 모의고사", desc: "전국연합 학력평가 등 외부 시험" },
  ETC: { label: "기타 평가", desc: "레벨 테스트, 경시 대비 등" },
};

export const ATT_LABEL: Record<AttendanceStatus, string> = { PRESENT: "출석", LATE: "지각", ABSENT: "결석" };

export const score = (n: number | null | undefined, unit = "점") => (n == null ? "—" : `${n}${unit}`);
export const pct = (n: number | null | undefined) => (n == null ? "—" : `${n}%`);
export const initial = (name: string) => (name.length > 2 ? name.slice(-2) : name);

/** 시험 입력 진행 상태 배지. */
export function examStatus(e: Exam): { label: string; tone: string } {
  if (e.participantCount === 0) return { label: "응시 대상 없음", tone: "t-mute" };
  if (e.enteredCount === 0) return { label: "성적 미입력", tone: "t-mute" };
  if (e.enteredCount < e.participantCount) return { label: `입력 중 ${e.enteredCount}/${e.participantCount}`, tone: "t-warn" };
  return { label: "입력 완료", tone: "t-ok" };
}

export function resultStatus(status: ResultStatus | null | undefined): { label: string; tone: string } {
  if (!status) return { label: "미입력", tone: "t-warn" };
  if (status === "ABSENT") return { label: "미응시", tone: "t-mute" };
  return { label: "입력 완료", tone: "t-ok" };
}

/** 최근 두 점수의 단순 변화. */
export function delta(scores: number[]) {
  if (scores.length < 2) return null;
  return scores[scores.length - 1] - scores[scores.length - 2];
}
export const signed = (n: number | null, unit = "점") => (n == null ? "—" : `${n > 0 ? "+" : ""}${n}${unit}`);
export const dirCls = (n: number | null) => (n == null || n === 0 ? "flat" : n > 0 ? "up" : "down");
