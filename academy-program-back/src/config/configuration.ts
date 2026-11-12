/**
 * 환경 변수(.env)를 앱 설정 객체로 매핑한다. `ConfigService.get('cors.origin')`처럼 꺼내 쓴다.
 */
export default () => ({
  port: Number(process.env.PORT ?? 4200),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  database: { url: process.env.DATABASE_URL ?? '' },
  cors: {
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },
});
