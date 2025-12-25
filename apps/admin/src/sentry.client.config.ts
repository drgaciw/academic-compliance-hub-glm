import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.browserTracingIntegration(),
  ],
  beforeSend(event) {
    if (event.user && typeof event.user.id === "string") {
      event.user.id = hashUserIdentifier(event.user.id);
    }
    return event;
  },
  environment: (process.env.NEXT_PUBLIC_VERCEL_ENV || "development") as string,
  release: (process.env.VERCEL_GIT_COMMIT_SHA || "local") as string,
});

function hashUserIdentifier(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}
