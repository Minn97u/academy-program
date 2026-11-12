import type { NextConfig } from "next";

// 백엔드(academy-program-back) 주소. 개발에서는 로컬 Nest, 그 외에는 API_BASE_URL이 있을 때만 연결한다.
function apiBaseUrl() {
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL;
  if (process.env.NODE_ENV === "development") return "http://localhost:4200";
  return null;
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    const base = apiBaseUrl();
    // /api/*를 같은 출처로 프록시한다.
    return base
      ? [{ source: "/api/:path*", destination: `${base}/api/:path*` }]
      : [];
  },
};

export default nextConfig;
