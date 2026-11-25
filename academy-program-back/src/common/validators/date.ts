import { Matches } from 'class-validator';

/** 'YYYY-MM-DD' 형식 날짜 문자열 검증 데코레이터. */
export const IsDateOnly = () =>
  Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '날짜는 YYYY-MM-DD 형식으로 입력하세요.',
  });

/** 'YYYY-MM' 형식 월 문자열 검증 데코레이터. */
export const IsMonthOnly = () =>
  Matches(/^\d{4}-\d{2}$/, {
    message: '월은 YYYY-MM 형식으로 입력하세요.',
  });
