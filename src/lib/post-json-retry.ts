class NonRetriableError extends Error {
  override name = "NonRetriableError";
}

/**
 * Browser-safe: resilient POST for flaky mobile / 3G. Retries 5xx, 429, and network errors;
 * does not retry other 4xx.
 */
export async function postJsonWithRetry<T = unknown>(
  url: string,
  body: unknown,
  options: { maxAttempts?: number; baseDelayMs?: number } = {}
): Promise<T> {
  const { maxAttempts = 4, baseDelayMs = 900 } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as T & { error?: string };

      if (res.ok) return data as T;

      if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
        lastError = new Error(
          (data && typeof data === "object" && typeof data.error === "string" && data.error) ||
            `Request failed: ${res.status}`
        );
        if (attempt < maxAttempts - 1) {
          await new Promise((r) => setTimeout(r, baseDelayMs * (attempt + 1)));
        }
        continue;
      }

      throw new NonRetriableError(
        (data && typeof data === "object" && typeof data.error === "string" && data.error) || res.statusText
      );
    } catch (e) {
      if (e instanceof NonRetriableError) throw e;
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, baseDelayMs * (attempt + 1)));
      }
    }
  }
  throw lastError ?? new Error("Request failed");
}
