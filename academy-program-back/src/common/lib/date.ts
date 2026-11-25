/** `@db.Date` 컬럼은 UTC 자정 Date로 오간다. API에서는 'YYYY-MM-DD' 문자열만 쓴다. */
export const toDateString = (d: Date) => d.toISOString().slice(0, 10);

export const toDate = (s: string) => new Date(`${s}T00:00:00.000Z`);

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 학원 기준(한국 시간) 오늘 날짜. 서버 시간대와 무관하게 `@db.Date`에 한국 날짜가 저장되게 한다. */
export const todayKst = () => toDate(toDateString(new Date(Date.now() + KST_OFFSET_MS)));

/** 'YYYY-MM' 한 달을 `{ gte: 1일, lt: 다음 달 1일 }` 조건으로 바꾼다. */
export function monthRange(month: string) {
  const [y, m] = month.split('-').map(Number);
  return { gte: new Date(Date.UTC(y, m - 1, 1)), lt: new Date(Date.UTC(y, m, 1)) };
}
