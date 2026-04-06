const rateWindowStore = new Map<string, { count: number; resetAt: number }>();

export function assertTrustedMutationOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");

  if (!origin) {
    return;
  }

  if (origin !== requestUrl.origin) {
    throw new Error("Cross-origin requests are not allowed");
  }
}

export function enforceRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
  label: string;
}) {
  const now = Date.now();
  const current = rateWindowStore.get(input.key);

  if (!current || current.resetAt <= now) {
    rateWindowStore.set(input.key, {
      count: 1,
      resetAt: now + input.windowMs,
    });
    return;
  }

  if (current.count >= input.limit) {
    throw new Error(`Too many ${input.label}. Try again in a few minutes.`);
  }

  current.count += 1;
  rateWindowStore.set(input.key, current);
}
