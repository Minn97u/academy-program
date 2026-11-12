# academy-program-front

Next.js 16 (App Router) + React 19. 별도 UI 라이브러리 없이 목업 디자인 시스템 CSS(`src/app/styles/globals.css`)를 그대로 쓴다.

## 실행

```bash
pnpm install
pnpm dev     # http://localhost:3000
```

개발 중 `/api/*` 요청은 `next.config.ts`의 rewrite로 `http://localhost:4200`(백엔드)에 프록시된다. 배포 시에는 `API_BASE_URL` 환경 변수로 지정한다.

## 구조

```
src/
  app/                 라우트 (page.tsx는 features의 페이지 컴포넌트를 렌더만 한다)
  features/
    shell/             AppShell(사이드바·헤더), PageHead
    home/ classes/ students/ exams/ attendance/ settings/
  shared/
    api/               request(), api.* 엔드포인트
    lib/               date, format, useQuery, useToday
    types/             백엔드 응답 모델
    ui/                Icon, Modal, controls(Dropdown·Seg·Tabs·Chips·Empty…), toast
```

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 |
| `pnpm build` / `pnpm start` | 프로덕션 빌드 / 실행 |
| `pnpm lint` | ESLint |
