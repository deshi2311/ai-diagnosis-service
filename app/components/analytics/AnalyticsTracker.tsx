"use client";

import { useEffect } from "react";

type Props = {
  event:
    | "landing_viewed"
    | "diagnosis_started"
    | "result_viewed";
  diagnosisId?: string;
  testRunId?: string;
};

export default function AnalyticsTracker({ event, diagnosisId, testRunId }: Props) {
  useEffect(() => {
    const run = async () => {
      try {
        await fetch("/api/analytics/session", { method: "POST" });
        await fetch("/api/analytics/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event,
            diagnosisId,
            testRunId,
            meta: { path: window.location.pathname },
          }),
        });
      } catch {
        // 計測失敗はUXを阻害しない
      }
    };
    void run();
  }, [event, diagnosisId, testRunId]);

  return null;
}
