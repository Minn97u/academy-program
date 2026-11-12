/** `@db.Date` 컬럼은 UTC 자정 Date로 오간다. API에서는 'YYYY-MM-DD' 문자열만 쓴다. */
export const toDateString = (d: Date) => d.toISOString().slice(0, 10);

export const toDate = (s: string) => new Date(`${s}T00:00:00.000Z`);
