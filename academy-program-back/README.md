# academy-program-back

NestJS 11 + Prisma 7 + PostgreSQL. 응답은 `{ success: true, data }` / `{ success: false, message, statusCode }` 로 통일한다.

## 실행

```bash
cp .env.example .env
pnpm install
pnpm db:up            # postgres:16 (localhost:5436)
pnpm prisma:migrate
pnpm db:seed
pnpm start:dev        # http://localhost:4200/api, Swagger http://localhost:4200/docs
```

## 구조

```
src/
  main.ts                  CORS, /api prefix, ValidationPipe, Swagger
  common/                  filters(예외), interceptors(응답 래핑), validators, lib/date
  prisma/                  PrismaService
  modules/
    settings/   GET, PATCH /settings
    teachers/   GET /teachers
    classes/    CRUD /classes
    students/   CRUD /students, POST·DELETE /students/:id/notes
    exams/      CRUD /exams, PUT·DELETE /exams/:id/results/:studentId
    attendance/ GET /attendance?date&classId, GET /attendance/calendar?month, PUT /attendance, DELETE /attendance/:studentId/:date
prisma/
  schema.prisma            Setting, Teacher, ClassRoom, Student, Exam, ExamResult, Attendance, StudentNote
  seed.ts                  샘플 데이터
```

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `pnpm start:dev` | 감시 모드 실행 |
| `pnpm build` / `pnpm start:prod` | 빌드 / 빌드 결과 실행 |
| `pnpm lint` / `pnpm typecheck` | ESLint / tsc |
| `pnpm db:up` / `pnpm db:down` | DB 컨테이너 올리기 / 내리기 |
| `pnpm prisma:migrate` | 개발 마이그레이션 |
| `pnpm db:seed` | 샘플 데이터 적재 |
