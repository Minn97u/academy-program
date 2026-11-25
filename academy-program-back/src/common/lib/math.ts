/** 소수 첫째 자리까지 반올림한 평균. 값이 없으면 null. */
export function avg(nums: number[]) {
  return nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : null;
}
