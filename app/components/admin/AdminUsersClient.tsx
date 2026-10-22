"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import RpgWindow from "@/app/components/RpgWindow";

type Row = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  diagnosisCount: number;
  lastDiagnosisAt: string | null;
};

export default function AdminUsersClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; email: string; role: string } | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        pageSize: String(pageSize),
      });
      if (q) params.set("q", q);
      if (role) params.set("role", role);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error(`読み込み失敗 (${res.status})`);
      const data = await res.json();
      setRows(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "失敗");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, q, role]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeRole = async () => {
    if (!confirm) return;
    const res = await fetch(`/api/admin/users/${confirm.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: confirm.role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "変更失敗");
      setConfirm(null);
      return;
    }
    setConfirm(null);
    void load();
  };

  const columns: GridColDef[] = [
    { field: "email", headerName: "メール", flex: 1, minWidth: 180 },
    { field: "name", headerName: "名前", width: 120 },
    { field: "role", headerName: "ロール", width: 100 },
    { field: "diagnosisCount", headerName: "診断数", width: 90 },
    {
      field: "actions",
      headerName: "操作",
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const row = params.row as Row;
        const next = row.role === "admin" ? "user" : "admin";
        return (
          <Button
            size="small"
            variant="outlined"
            onClick={() => setConfirm({ id: row.id, email: row.email, role: next })}
          >
            {next} にする
          </Button>
        );
      },
    },
  ];

  return (
    <Stack spacing={2}>
      <RpgWindow title="フィルタ">
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            label="検索（名前/メール）"
            size="small"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <TextField
            select
            label="ロール"
            size="small"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">すべて</MenuItem>
            <MenuItem value="user">user</MenuItem>
            <MenuItem value="admin">admin</MenuItem>
          </TextField>
          <Button variant="contained" onClick={() => { setPage(0); void load(); }}>
            検索
          </Button>
        </Stack>
      </RpgWindow>

      {error ? (
        <Alert severity="error" action={<Button onClick={() => void load()}>再試行</Button>}>
          {error}
        </Alert>
      ) : null}

      <Box sx={{ height: 480, width: "100%", bgcolor: "#F3E6C8" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            rowCount={total}
            paginationMode="server"
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(m) => {
              setPage(m.page);
              setPageSize(m.pageSize);
            }}
            pageSizeOptions={[10, 20, 50]}
            disableRowSelectionOnClick
            localeText={{ noRowsLabel: "ユーザーがありません（空状態）" }}
          />
        )}
      </Box>

      <Dialog open={!!confirm} onClose={() => setConfirm(null)}>
        <DialogTitle>ロール変更の確認</DialogTitle>
        <DialogContent>
          <Typography>
            対象: {confirm?.email}
            <br />
            変更後ロール: <strong>{confirm?.role}</strong>
          </Typography>
          <Typography sx={{ mt: 1, fontSize: "0.9rem" }}>
            自分自身の変更と、最後の管理者の降格はサーバー側で拒否されます。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>キャンセル</Button>
          <Button variant="contained" onClick={() => void changeRole()}>
            変更する
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
