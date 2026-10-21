"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  DIAGNOSIS_QUESTIONS,
  type DiagnosisAnswers,
} from "@/lib/diagnosis/questions";
import RpgWindow from "../RpgWindow";
import RpgTypeText from "../RpgTypeText";
import { dqColors } from "../../theme";

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
    <RpgWindow title="ぼうけんのしょ — キャリア診断" className="dq-enter">
      <Typography
        component="div"
        sx={{ color: dqColors.inkMuted, mb: 3, lineHeight: 1.8, minHeight: "1.8em" }}
      >
        <RpgTypeText text="5つの問いに答えよ。AIがつぎの道を示す（約3分）" msPerChar={42} />
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
            className="dq-cursor"
            sx={{ alignSelf: "flex-start" }}
          >
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={18} color="inherit" />
                <span>AIぶんせきちゅう...</span>
              </Box>
            ) : (
              "しんだんする"
            )}
          </Button>
        </Stack>
      </Box>
    </RpgWindow>
  );
}
