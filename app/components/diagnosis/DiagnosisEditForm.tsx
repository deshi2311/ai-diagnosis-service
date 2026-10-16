"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type EditPayload = {
  id: string;
  result: {
    strengthType: string;
    suitableJobs: string[];
    nextSteps: string[];
    summary: string;
  };
  careerRoadmap: {
    shortTerm: string;
    midTerm: string;
    longTerm: string;
  };
};

export default function DiagnosisEditForm({ initial }: { initial: EditPayload }) {
  const router = useRouter();
  const [strengthType, setStrengthType] = useState(initial.result.strengthType);
  const [suitableJobs, setSuitableJobs] = useState(
    initial.result.suitableJobs.join("\n"),
  );
  const [nextSteps, setNextSteps] = useState(initial.result.nextSteps.join("\n"));
  const [summary, setSummary] = useState(initial.result.summary);
  const [shortTerm, setShortTerm] = useState(initial.careerRoadmap.shortTerm);
  const [midTerm, setMidTerm] = useState(initial.careerRoadmap.midTerm);
  const [longTerm, setLongTerm] = useState(initial.careerRoadmap.longTerm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/diagnosis/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result: {
            strengthType,
            suitableJobs: suitableJobs
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            nextSteps: nextSteps
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            summary,
          },
          careerRoadmap: { shortTerm, midTerm, longTerm },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "更新に失敗しました");
      router.push(`/diagnosis/${initial.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
          診断結果を編集
        </Typography>
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              label="強みタイプ"
              value={strengthType}
              onChange={(e) => setStrengthType(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="向いている職種（1行に1つ）"
              value={suitableJobs}
              onChange={(e) => setSuitableJobs(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
            <TextField
              label="次の一歩（1行に1つ）"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
            <TextField
              label="要約"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              required
            />
            <TextField
              label="短期プラン"
              value={shortTerm}
              onChange={(e) => setShortTerm(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="中期プラン"
              value={midTerm}
              onChange={(e) => setMidTerm(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="長期プラン"
              value={longTerm}
              onChange={(e) => setLongTerm(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? "保存中..." : "保存する"}
              </Button>
              <Button href={`/diagnosis/${initial.id}`} variant="outlined">
                キャンセル
              </Button>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
