import { getToken } from "./storage";

export type ApiError = { status: number; error: string; fields?: Record<string, string> };

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/$/, "");
const TEMPORARY_ERROR = "Сервис временно недоступен. Попробуйте ещё раз.";

function withApiBase(url: string): string {
  // In development requests can go through a shared API prefix.
  if (!API_BASE) return url;
  if (/^https?:\/\//.test(url)) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function normalizeError(status: number, value: string): string {
  const text = value.trim();
  if (!text) return status >= 500 ? TEMPORARY_ERROR : "request_failed";
  if (text.startsWith("<") || text.includes("<html")) return status >= 500 ? TEMPORARY_ERROR : "request_failed";
  return text;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(withApiBase(url), { ...init, headers });
  } catch {
    throw { status: 0, error: TEMPORARY_ERROR } as ApiError;
  }

  const contentType = res.headers.get("content-type") ?? "";

  if (!res.ok) {
    let err: ApiError = { status: res.status, error: res.status >= 500 ? TEMPORARY_ERROR : "request_failed" };
    try {
      if (contentType.includes("application/json")) {
        err = { status: res.status, ...(await res.json()) };
      } else {
        err = { status: res.status, error: normalizeError(res.status, await res.text()) };
      }
    } catch {
      // Keep the generic message if the response body cannot be parsed.
    }
    err.error = normalizeError(res.status, err.error);
    throw err;
  }

  if (res.status === 204) return undefined as T;
  if (contentType.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string) =>
    request<T>(url, { method: "DELETE" }),
};
