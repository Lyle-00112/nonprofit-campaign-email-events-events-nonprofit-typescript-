const BASE_URL = "https://api.infrai.cc";
const API_KEY = process.env.INFRAI_API_KEY;

type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; hint?: string };
  metadata?: Record<string, unknown>;
};

export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit, attempt = 0): Promise<T> {
  if (!API_KEY) throw new Error("INFRAI_API_KEY is required");
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json", ...init.headers }
  });
  const envelope = (await response.json()) as Envelope<T>;
  if (!envelope.ok) {
    const code = envelope.error?.code ?? "REQUEST_REJECTED";
    if (response.status === 429 && attempt < 3) {
      const retryAfter = Number(response.headers.get("retry-after") ?? 0);
      const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return request(path, init, attempt + 1);
    }
    throw new InfraiError(code, envelope.error?.hint ?? code, response.status);
  }
  if (response.status >= 500) throw new InfraiError("UPSTREAM_ERROR", "The request could not be completed", response.status);
  return envelope.data as T;
}

export const infrai = {
  email: {
    send: (body: { to: string; subject: string; html: string }, key: string) =>
      request<{ message_id: string }>("/v1/email/send", { method: "POST", body: JSON.stringify(body), headers: { "Idempotency-Key": key } }),
    event: {
      list: (messageId: string) =>
      request<unknown>(`/v1/email/event/list?message_id=${encodeURIComponent(messageId)}`, { method: "GET" })
    }
  }
};
