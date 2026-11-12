export const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/** 로컬 기준 오늘 'YYYY-MM-DD'. */
export function today() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const fmt = (t: Date) => t.toISOString().slice(0, 10);

export const addDays = (s: string, n: number) => {
  const t = parse(s);
  t.setUTCDate(t.getUTCDate() + n);
  return fmt(t);
};
export const addMonths = (month: string, n: number) => {
  const [y, m] = month.split("-").map(Number);
  return fmt(new Date(Date.UTC(y, m - 1 + n, 1))).slice(0, 7);
};
export const dayOfWeek = (s: string) => parse(s).getUTCDay();
export const dot = (s: string) => s.replace(/-/g, ".");
export const monthLabel = (m: string) => `${m.slice(0, 4)}년 ${Number(m.slice(5, 7))}월`;
export const fullDate = (s: string) => {
  const t = parse(s);
  return `${t.getUTCFullYear()}년 ${t.getUTCMonth() + 1}월 ${t.getUTCDate()}일 ${DOW[t.getUTCDay()]}요일`;
};
/** 달력 셀: 앞쪽 공백은 null. */
export function monthCells(month: string): (string | null)[] {
  const first = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (string | null)[] = Array.from({ length: dayOfWeek(first) }, () => null);
  for (let d = 1; d <= days; d++) cells.push(`${month}-${String(d).padStart(2, "0")}`);
  return cells;
}
export const scheduleLabel = (c: { days: number[]; startTime: string; endTime: string }) =>
  `${c.days.map((d) => DOW[d]).join("")} ${c.startTime}–${c.endTime}`;
