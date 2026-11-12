# academy-program

학원 선생님용 관리 프로그램. 정규반·학생·시험(성적 입력)·출결을 기본 CRUD로 다룬다.

| 디렉터리 | 스택 | 포트 |
| --- | --- | --- |
| `academy-program-front` | Next.js 16 (App Router), React 19 | 3000 |
| `academy-program-back` | NestJS 11, Prisma 7, PostgreSQL 16 | 4200 (API `/api`, Swagger `/docs`) |

## 빠른 시작

```bash
# 1. 백엔드 + DB
cd academy-program-back
cp .env.example .env
pnpm install
pnpm db:up              # docker compose, postgres :5436
pnpm prisma:migrate     # 마이그레이션 적용
pnpm db:seed            # 샘플 데이터 (반 6개, 학생 42명, 시험 12개)
pnpm start:dev          # http://localhost:4200/docs

# 2. 프론트
cd ../academy-program-front
pnpm install
pnpm dev                # http://localhost:3000 (/api/* 는 백엔드로 프록시)
```

## 화면

- 홈: 오늘 수업, 출석 체크 현황, 최근 시험
- 정규반 관리: 목록(카드/표), 등록·수정·삭제, 상세(학생 명단 / 시험 / 출결)
- 학생 관리: 검색·학년·반 필터, 등록·수정·삭제, 상세(시험 기록 / 출결 달력 / 상담 메모)
- 시험 관리: 유형·반·기간 필터, 등록, 상세(학생별 점수·오답 문항 입력, 순위)
- 출결 관리: 날짜·반 선택, 출석/지각/결석 체크, 비고, 월 달력
- 설정: 선생님 이름, 학원 이름

AI 분석·리포트 등 분석 기능은 범위에서 제외했다.
