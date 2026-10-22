import {
  Box,
  Container,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { redirect, notFound } from "next/navigation";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectMongo } from "@/lib/mongoose";
import { Diagnosis } from "@/lib/models/Diagnosis";
import { DIAGNOSIS_QUESTIONS } from "@/lib/diagnosis/questions";
import MemberHeader from "@/app/components/MemberHeader";
import DiagnosisDetailActions from "@/app/components/diagnosis/DiagnosisDetailActions";
import DiagnosisDisclaimer from "@/app/components/diagnosis/DiagnosisDisclaimer";
import NextStepsList from "@/app/components/diagnosis/NextStepsList";
import RpgWindow from "@/app/components/RpgWindow";
import { dqColors } from "@/app/theme";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function DiagnosisDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  await connectMongo();
  const doc = await Diagnosis.findById(id).lean();
  if (!doc || String(doc.userId) !== session.user.id) notFound();

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <MemberHeader
        name={session.user.name}
        image={session.user.image}
        role={session.user.role}
      />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack
          spacing={2}
          sx={{
            mb: 3,
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              component="h1"
              sx={{
                fontFamily: "var(--font-display), DotGothic16, monospace",
                fontSize: { xs: "1.4rem", md: "1.75rem" },
                color: dqColors.gold,
                letterSpacing: "0.1em",
              }}
            >
              けっかの しょうさい
            </Typography>
            <Typography variant="caption" sx={{ color: dqColors.parchment, opacity: 0.7 }}>
              {doc.createdAt
                ? new Date(doc.createdAt).toLocaleString("ja-JP")
                : ""}
            </Typography>
          </Box>
          <DiagnosisDetailActions id={id} />
        </Stack>

        <Stack spacing={2.5}>
          <RpgWindow title="つよさタイプ">
            <Typography
              sx={{
                fontFamily: "var(--font-display), DotGothic16, monospace",
                fontSize: "1.3rem",
                color: dqColors.crimson,
                mb: 2,
              }}
            >
              {doc.result?.strengthType}
            </Typography>
            <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
              {doc.result?.summary}
            </Typography>
          </RpgWindow>

          <RpgWindow title="むいている しょくぎょう / つぎのいっぽ">
            <Typography
              sx={{
                fontFamily: "var(--font-display), DotGothic16, monospace",
                mb: 1,
                color: dqColors.ink,
              }}
            >
              向いている職種
            </Typography>
            <List dense>
              {(doc.result?.suitableJobs ?? []).map((job: string) => (
                <ListItem key={job} disableGutters>
                  <ListItemText
                    primary={
                      <Typography className="dq-cursor">{job}</Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 2.5 }}>
              <NextStepsList steps={doc.result?.nextSteps ?? []} />
            </Box>
          </RpgWindow>

          <RpgWindow title="キャリアロードマップ">
            <Typography sx={{ mb: 1.5 }}>
              <strong>みじかいみち:</strong> {doc.careerRoadmap?.shortTerm}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              <strong>なかみち:</strong> {doc.careerRoadmap?.midTerm}
            </Typography>
            <Typography>
              <strong>とおみち:</strong> {doc.careerRoadmap?.longTerm}
            </Typography>
          </RpgWindow>

          <RpgWindow title="あなたの かいとう">
            <Stack spacing={1.5}>
              {DIAGNOSIS_QUESTIONS.map((q, i) => (
                <Box key={q.id}>
                  <Typography variant="subtitle2" sx={{ color: dqColors.inkMuted }}>
                    Q{i + 1}. {q.label}
                  </Typography>
                  <Typography>{doc.answers?.[q.id]}</Typography>
                </Box>
              ))}
            </Stack>
          </RpgWindow>

          <DiagnosisDisclaimer />
        </Stack>
      </Container>
    </Box>
  );
}
