"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import RpgWindow from "@/app/components/RpgWindow";
import { dqColors } from "@/app/theme";

type Item = {
  id: string;
  occurredAt: string;
  type: string;
  message: string;
  impact: string;
  status: "open" | "resolved";
  source: string;
};

export default function AdminErrorsClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/errors?status=${status}`);
      if (!res.ok) throw new Error(`読み込み失敗 (${res.status})`);
      const data = await res.json();
      setItems(data.items);
      setUpdatedAt(data.updatedAt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "失敗");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const resolve = async (id: string) => {
    if (!window.confirm(`エラー ${id} を resolved にしますか？`)) return;
    const res = await fetch(`/api/admin/errors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved" }),
    });
    if (!res.ok) {
      setError("更新失敗");
      return;
    }
    void load();
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <TextField
          select
          size="small"
          label="状態"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            minWidth: 140,
            "& .MuiInputLabel-root": {
              color: dqColors.ink,
              bgcolor: "#FFF8E7",
              px: 0.5,
              "&.Mui-focused": { color: dqColors.ink },
            },
          }}
        >
          <MenuItem value="open">open</MenuItem>
          <MenuItem value="resolved">resolved</MenuItem>
          <MenuItem value="">すべて</MenuItem>
        </TextField>
        <Button variant="outlined" onClick={() => void load()}>
          更新
        </Button>
        {updatedAt ? (
          <Typography sx={{ fontSize: "0.85rem", color: dqColors.parchment }}>
            最終更新: {new Date(updatedAt).toLocaleString("ja-JP")}
          </Typography>
        ) : null}
      </Stack>

      {error ? (
        <Alert severity="error" action={<Button onClick={() => void load()}>再試行</Button>}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <CircularProgress />
      ) : items.length === 0 ? (
        <Alert severity="info">表示するエラーログがありません（空状態）</Alert>
      ) : (
        items.map((e) => (
          <RpgWindow key={e.id} title={`${e.type} / ${e.status}`}>
            <Typography sx={{ fontSize: "0.85rem" }}>
              発生: {e.occurredAt ? new Date(e.occurredAt).toLocaleString("ja-JP") : ""}
            </Typography>
            <Typography>影響: {e.impact}</Typography>
            <Typography>内容: {e.message}</Typography>
            <Typography sx={{ fontSize: "0.85rem" }}>source: {e.source}</Typography>
            {e.status === "open" ? (
              <Button sx={{ mt: 1 }} size="small" variant="contained" onClick={() => void resolve(e.id)}>
                対応済みにする
              </Button>
            ) : null}
          </RpgWindow>
        ))
      )}
    </Stack>
  );
}
