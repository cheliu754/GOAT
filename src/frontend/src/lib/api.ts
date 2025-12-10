// const API_BASE_RAW = import.meta.env.VITE_API_BASE_URL;
const API_BASE_RAW = "https://cs409.api.illinihouse.space";
const API_BASE = API_BASE_RAW ? API_BASE_RAW.replace(/\/$/, "") : "";

type RequestOptions = {
  method?: string;
  body?: Record<string, unknown> | FormData | null;
  token?: string | null;
  headers?: Record<string, string>;
};

async function apiRequest<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_BASE && !path.startsWith("http")) {
    throw new Error("VITE_API_BASE_URL is not set");
  }
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = options.headers ? { ...options.headers } : {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body
      ? isFormData
        ? (options.body as FormData)
        : JSON.stringify(options.body)
      : undefined,
  });

  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message = (data && (data.message || data.error)) || response.statusText;
    throw new Error(message);
  }

  return data as T;
}

const apiGet = <T = any>(path: string, token?: string | null) =>
  apiRequest<T>(path, { method: "GET", token });
const apiPost = <T = any>(path: string, body?: Record<string, unknown>, token?: string | null) =>
  apiRequest<T>(path, { method: "POST", body, token });
const apiPut = <T = any>(path: string, body?: Record<string, unknown>, token?: string | null) =>
  apiRequest<T>(path, { method: "PUT", body, token });
const apiDelete = <T = any>(path: string, token?: string | null) =>
  apiRequest<T>(path, { method: "DELETE", token });

export { API_BASE, apiRequest, apiGet, apiPost, apiPut, apiDelete };
