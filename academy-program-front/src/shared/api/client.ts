// 백엔드 호출 공통. Nest 전역 인터셉터가 { success, data } / { success:false, message }로 감싸므로 여기서 풀어준다.
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "서버에 연결할 수 없어요");
  }
  const json = (await res.json().catch(() => null)) as
    | { success: true; data: T }
    | { success: false; message: string }
    | null;
  if (!json) throw new ApiError(res.status || 500, "서버 응답을 읽을 수 없어요");
  if (!json.success) throw new ApiError(res.status, json.message);
  return json.data;
}

export function qs(params: Record<string, string | number | undefined | null>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
}
