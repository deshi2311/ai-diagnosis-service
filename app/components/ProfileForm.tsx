"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";

type Profile = {
  id: string;
  name: string;
  email: string;
  image: string;
};

export default function ProfileForm() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) {
          throw new Error("プロフィールの取得に失敗しました");
        }
        const data = (await res.json()) as Profile;
        if (!cancelled) {
          setProfile(data);
          setName(data.name);
        }
      } catch {
        if (!cancelled) {
          setProfile({
            id: session?.user?.id ?? "",
            name: session?.user?.name ?? "",
            email: session?.user?.email ?? "",
            image: session?.user?.image ?? "",
          });
          setName(session?.user?.name ?? "");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "保存に失敗しました");
      }
      setProfile(data);
      await update({ name: data.name });
      setMessage("プロフィールを保存しました");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar
            alt={profile?.name ?? "ユーザー"}
            src={profile?.image || undefined}
            sx={{ width: 72, height: 72 }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {profile?.name || "未設定"}
            </Typography>
            <Typography color="text.secondary">{profile?.email}</Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            slotProps={{ htmlInput: { maxLength: 50 } }}
          />
          <TextField
            label="メール"
            value={profile?.email ?? ""}
            fullWidth
            disabled
            helperText="メールアドレスはGoogleアカウントの値を使用します"
          />
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" disabled={saving} sx={{ justifySelf: "start" }}>
            {saving ? "保存中..." : "変更を保存"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
