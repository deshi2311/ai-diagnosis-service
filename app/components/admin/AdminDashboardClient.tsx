"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
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

type Analytics = {
  updatedAt: string;
  kpi: {
    todayDiagnoses: { value: number; judge: string; next: string };
    totalDiagnoses: { value: number; judge: string; next: string };
    activeUsers: { value: number; judge: string; next: string };
    completionRate: { value: number | null; judge: string; next: string };
    dayOverDay: { value: number | null; reason: string | null };
    weekOverWeek: { value: number | null; reason: string | null };
  };
  trend: { bucket: string; count: number }[];
  recentDiagnoses: {
    id: string;
    strengthType: string;
    summary: string;
    createdAt: string;
  }[];
  funnel: {
    maxDropStep: string | null;
    referenceOnly: boolean;
    steps: { event: string; reached: number; dropOffRate: number | null }[];
  };
  system: { db: { ok: boolean; latencyMs: number }; openErrorCount: number };
  empty: boolean;
};

function KpiCard({
  title,
  value,
  judge,
  next,
  compare,
}: {
  title: string;
  value: string;
  judge: string;
  next: string;
  compare?: string;
}) {
  return (
    <RpgWindow sx={{ height: "100%" }}>
      <Typography sx={{ color: dqColors.inkMuted, fontSize: "0.85rem" }}>{title}</Typography>
      <Typography
        sx={{
          fontFamily: "var(--font-display), DotGothic16, monospace",
          fontSize: "1.6rem",
          color: dqColors.crimson,
          my: 1,
        }}
      >
        {value}
      </Typography>
      {compare ? (
        <Typography sx={{ fontSize: "0.85rem", mb: 1 }}>{compare}</Typography>
      ) : null}
      <Typography sx={{ fontSize: "0.85rem" }}>
        <strong>判断:</strong> {judge}
      </Typography>
      <Typography sx={{ fontSize: "0.85rem" }}>
        <strong>次:</strong> {next}
      </Typography>
    </RpgWindow>
  );
}

export default function AdminDashboardClient() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/analytics?granularity=day");
      if (!res.ok) throw new Error(`読み込み失敗 (${res.status})`);
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込み失敗");
    } finally {
      setLoading(false);
    }
  }, []);

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
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={() => void load()}>
            再試行
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!data) return null;

  const dod =
    data.kpi.dayOverDay.value == null
      ? data.kpi.dayOverDay.reason ?? "—"
      : `前日比 ${data.kpi.dayOverDay.value}%`;
  const wow =
    data.kpi.weekOverWeek.value == null
      ? data.kpi.weekOverWeek.reason ?? "—"
      : `前週比 ${data.kpi.weekOverWeek.value}%`;

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, alignItems: "center" }}>
        <Typography sx={{ color: dqColors.parchment, opacity: 0.8, fontSize: "0.85rem" }}>
          最終更新: {new Date(data.updatedAt).toLocaleString("ja-JP")}（画面表示時＋手動）
        </Typography>
        <Button size="small" variant="outlined" onClick={() => void load()} disabled={loading}>
          更新
        </Button>
        <Button size="small" variant="outlined" href="/api/admin/analytics/csv">
          CSV
        </Button>
      </Stack>

      {data.empty ? (
        <Alert severity="info">診断データがまだありません（空状態）</Alert>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
        }}
      >
        <KpiCard
          title="本日の診断数"
          value={String(data.kpi.todayDiagnoses.value)}
          compare={dod}
          judge={data.kpi.todayDiagnoses.judge}
          next={data.kpi.todayDiagnoses.next}
        />
        <KpiCard
          title="総診断数"
          value={String(data.kpi.totalDiagnoses.value)}
          judge={data.kpi.totalDiagnoses.judge}
          next={data.kpi.totalDiagnoses.next}
        />
        <KpiCard
          title="アクティブユーザー"
          value={String(data.kpi.activeUsers.value)}
          compare={wow}
          judge={data.kpi.activeUsers.judge}
          next={data.kpi.activeUsers.next}
        />
        <KpiCard
          title="診断完了率"
          value={
            data.kpi.completionRate.value == null
              ? "—"
              : `${data.kpi.completionRate.value}%`
          }
          judge={data.kpi.completionRate.judge}
          next={data.kpi.completionRate.next}
        />
      </Box>

      <RpgWindow title="診断数の推移（日別）">
        {data.trend.length === 0 ? (
          <Typography color="text.secondary">表示期間にデータがありません</Typography>
        ) : (
          <Box sx={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="診断数" fill={dqColors.crimson} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </RpgWindow>

      <RpgWindow title="ファネル要約（最大離脱）">
        <Typography sx={{ mb: 1 }}>
          最大離脱地点:{" "}
          <strong>{data.funnel.maxDropStep ?? "データ不足"}</strong>
          {data.funnel.referenceOnly ? "（参考値・母数少）" : ""}
        </Typography>
        <Typography sx={{ mb: 2, fontSize: "0.9rem", color: dqColors.inkMuted }}>
          起点コホート（期間内LP閲覧session）・変換期限7日。詳細は分析タブへ。
        </Typography>
        <Button component={Link} href="/admin/analytics?tab=funnel" variant="contained">
          ファネル分析を見る
        </Button>
      </RpgWindow>

      <RpgWindow title="最近の診断結果">
        {data.recentDiagnoses.length === 0 ? (
          <Typography color="text.secondary">まだありません</Typography>
        ) : (
          <Stack spacing={1}>
            {data.recentDiagnoses.slice(0, 8).map((d) => (
              <Box key={d.id} sx={{ borderBottom: `1px solid ${dqColors.goldDark}`, pb: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>{d.strengthType || "(未設定)"}</Typography>
                <Typography sx={{ fontSize: "0.85rem" }}>{d.summary}</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: dqColors.inkMuted }}>
                  {d.createdAt ? new Date(d.createdAt).toLocaleString("ja-JP") : ""} / id:{d.id}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </RpgWindow>

      <RpgWindow title="システム状態">
        <Typography>
          DB: {data.system.db.ok ? "OK" : "NG"}（{data.system.db.latencyMs}ms）
        </Typography>
        <Typography>未対応エラー: {data.system.openErrorCount} 件</Typography>
        <Typography sx={{ fontSize: "0.85rem", color: dqColors.inkMuted }}>
          診断API常時ヘルスは未実装（仕様書「未確認」）
        </Typography>
      </RpgWindow>
    </Stack>
  );
}
