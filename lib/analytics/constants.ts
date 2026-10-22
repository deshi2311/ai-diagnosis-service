export const ANALYTICS_COOKIE = "aid_sid";
export const FUNNEL_CONVERSION_DAYS = 7;
export const ANALYTICS_TZ = "Asia/Tokyo";

export const FUNNEL_EVENTS = [
  "landing_viewed",
  "login_completed",
  "diagnosis_started",
  "diagnosis_answered",
  "diagnosis_completed",
  "result_viewed",
] as const;

export type FunnelEventName = (typeof FUNNEL_EVENTS)[number];
