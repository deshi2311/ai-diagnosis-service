import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    if (event.extra) {
      for (const key of Object.keys(event.extra)) {
        if (/password|token|cookie|authorization|answers|q[1-5]/i.test(key)) {
          delete event.extra[key];
        }
      }
    }
    return event;
  },
});
