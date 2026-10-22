"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import RpgWindow from "@/app/components/RpgWindow";
import { dqColors } from "@/app/theme";

type Payload = {
  updatedAt: string;
  timezone: string;
  conversionWindowDays: number;
  trend: { bucket: string; count: number }[];
  distribution: { strengthType: { label: string; count: number }[] };
  answerTendency: {
    purpose: { term: string; count: number }[];
    values: { term: string; count: number }[];
    experience: { term: string; count: number }[];
    future: { term: string; count: number }[];
  };
  topCareerPaths: { path: string; count: number }[];
  funnel: FunnelPayload;
  funnelUser: FunnelPayload;
};

type FunnelPayload = {
  unit: string;
  cohortSize: number;
  note: string;
  referenceOnly: boolean;
  maxDropStep: string | null;
  guidance: { from: string; to: string; judge: string; next: string }[];
  steps: {
    event: string;
    reached: number;
    reachRateFromStart: number | null;
    transitionRateFromPrev: number | null;
    dropOff: number | null;
    dropOffRate: number | null;
  }[];
};

export default function AdminAnalyticsClient() {
  const search = useSearchParams();
  const initialTab = search.get("tab") === "funnel" ? 1 : 0;
  const [tab, setTab] = useState(initialTab);
  const [granularity, setGranularity] = useState<"day" | "week" | "month">("day");
  const [funnelUnit, setFunnelUnit] = useState<"session" | "user">("session");
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const qs = useMemo(() => `granularity=${granularity}`, [granularity]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics?${qs}`);
      if (!res.ok) throw new Error(`読み込み失敗 (${res.status})`);
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "失敗");
    } finally {
      setLoading(false);
    }
  }, [qs]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress aria-label="読み込み中" />
      </Box>
    );
  }
  if (error && !data) {
    return (
      <Alert severity="error" action={<Button onClick={() => void load()}>再試行</Button>}>
        {error}
      </Alert>
    );
  }
  if (!data) return null;

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, alignItems: "center" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
          <Tab label="全体分析" />
          <Tab label="ファネル分析" />
        </Tabs>
        <Button size="small" variant={granularity === "day" ? "contained" : "outlined"} onClick={() => setGranularity("day")}>
          日別
        </Button>
        <Button size="small" variant={granularity === "week" ? "contained" : "outlined"} onClick={() => setGranularity("week")}>
          週別
        </Button>
        <Button size="small" variant={granularity === "month" ? "contained" : "outlined"} onClick={() => setGranularity("month")}>
          月別
        </Button>
        <Button size="small" variant="outlined" onClick={() => void load()} disabled={loading}>
          更新
        </Button>
        <Button size="small" variant="outlined" href={`/api/admin/analytics/csv?${qs}`}>
          CSV出力
        </Button>
      </Stack>
      <Typography sx={{ color: dqColors.parchment, opacity: 0.8, fontSize: "0.85rem" }}>
        TZ={data.timezone} / 最終更新 {new Date(data.updatedAt).toLocaleString("ja-JP")} /
        文字コード CSV UTF-8 BOM
      </Typography>

      {tab === 0 ? (
        <Stack spacing={2}>
          <RpgWindow title="診断数推移">
            <Box sx={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={data.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="件数" fill={dqColors.crimson} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </RpgWindow>
          <RpgWindow title="診断結果分布（強みタイプ）">
            {data.distribution.strengthType.length === 0 ? (
              <Typography>空状態: 分布データなし</Typography>
            ) : (
              <Stack spacing={0.5}>
                {data.distribution.strengthType.map((r) => (
                  <Typography key={r.label}>
                    {r.label}: {r.count}
                  </Typography>
                ))}
              </Stack>
            )}
          </RpgWindow>
          <RpgWindow title="回答傾向（キーワード上位）">
            <Typography sx={{ mb: 1, fontSize: "0.85rem" }}>
              目的=q1 / 価値観=q2 / 経験=q3 / 将来像=q5（簡易トークン集計）
            </Typography>
            {(
              [
                ["目的・状況", data.answerTendency.purpose],
                ["価値観", data.answerTendency.values],
                ["経験・強み", data.answerTendency.experience],
                ["将来像", data.answerTendency.future],
              ] as const
            ).map(([label, rows]) => (
              <Box key={label} sx={{ mb: 1.5 }}>
                <Typography sx={{ fontWeight: 700 }}>{label}</Typography>
                <Typography sx={{ fontSize: "0.9rem" }}>
                  {rows.length ? rows.map((r) => `${r.term}(${r.count})`).join(" / ") : "—"}
                </Typography>
              </Box>
            ))}
          </RpgWindow>
          <RpgWindow title="人気キャリアパス TOP10">
            {data.topCareerPaths.length === 0 ? (
              <Typography>空状態</Typography>
            ) : (
              data.topCareerPaths.map((r, i) => (
                <Typography key={r.path}>
                  {i + 1}. {r.path}（{r.count}）
                </Typography>
              ))
            )}
          </RpgWindow>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Button
              size="small"
              variant={funnelUnit === "session" ? "contained" : "outlined"}
              onClick={() => setFunnelUnit("session")}
            >
              session基準（全体）
            </Button>
            <Button
              size="small"
              variant={funnelUnit === "user" ? "contained" : "outlined"}
              onClick={() => setFunnelUnit("user")}
            >
              user基準（ログイン後）
            </Button>
          </Stack>
          {(() => {
            const funnel = funnelUnit === "user" ? data.funnelUser : data.funnel;
            return (
              <>
                <RpgWindow title="起点コホート・ファネル">
                  <Typography sx={{ mb: 1 }}>{funnel.note}</Typography>
                  <Typography sx={{ mb: 1 }}>
                    母数単位: {funnel.unit} / cohort={funnel.cohortSize} /
                    変換期限 {data.conversionWindowDays}日
                    {funnel.referenceOnly ? " / 参考値" : ""}
                  </Typography>
                  <Typography sx={{ mb: 2 }}>
                    最大離脱: <strong>{funnel.maxDropStep ?? "—"}</strong>
                  </Typography>
                  <Box sx={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 14,
                      }}
                    >
                      <thead>
                        <tr>
                          <th align="left">段階</th>
                          <th align="right">到達</th>
                          <th align="right">開始からの到達率</th>
                          <th align="right">直前からの遷移率</th>
                          <th align="right">離脱</th>
                          <th align="right">離脱率</th>
                        </tr>
                      </thead>
                      <tbody>
                        {funnel.steps.map((s) => (
                          <tr key={s.event}>
                            <td>{s.event}</td>
                            <td align="right">{s.reached}</td>
                            <td align="right">{s.reachRateFromStart ?? "—"}%</td>
                            <td align="right">
                              {s.transitionRateFromPrev ?? "—"}%
                            </td>
                            <td align="right">{s.dropOff ?? "—"}</td>
                            <td align="right">{s.dropOffRate ?? "—"}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </RpgWindow>
                <RpgWindow title="管理者の判断と次アクション">
                  {funnel.guidance.map((g) => (
                    <Box key={`${g.from}-${g.to}`} sx={{ mb: 1.5 }}>
                      <Typography sx={{ fontWeight: 700 }}>
                        {g.from} → {g.to}
                      </Typography>
                      <Typography sx={{ fontSize: "0.9rem" }}>
                        判断: {g.judge}
                      </Typography>
                      <Typography sx={{ fontSize: "0.9rem" }}>
                        次: {g.next}
                      </Typography>
                    </Box>
                  ))}
                </RpgWindow>
              </>
            );
          })()}
        </Stack>
      )}
    </Stack>
  );
}
