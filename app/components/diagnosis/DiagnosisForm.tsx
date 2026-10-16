"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  DIAGNOSIS_QUESTIONS,
  type DiagnosisAnswers,
} from "@/lib/diagnosis/questions";

const emptyAnswers: DiagnosisAnswers = {
  q1: "",
  q2: "",
  q3: "",
  q4: "",
  q5: "",
};

export default function DiagnosisForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<DiagnosisAnswers>(emptyAnswers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "診断に失敗しました");
      }
      router.push(`/diagnosis/result?id=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "診断に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          キャリア診断（5問）
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          回答をもとにAIがキャリアロードマップを作成します（約1分）
        </Typography>
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2.5}>
            {DIAGNOSIS_QUESTIONS.map((q, index) => (
              <TextField
                key={q.id}
                label={`Q${index + 1}. ${q.label}`}
                placeholder={q.placeholder}
                value={answers[q.id]}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                required
                fullWidth
                multiline
                minRows={2}
                slotProps={{ htmlInput: { maxLength: 1000 } }}
              />
            ))}
            {error && <Alert severity="error">{error}</Alert>}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                alignSelf: "flex-start",
                background: "linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)",
              }}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={18} color="inherit" />
                  <span>AI分析中...</span>
                </Box>
              ) : (
                "診断する"
              )}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
