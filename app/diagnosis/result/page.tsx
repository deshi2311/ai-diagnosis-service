import {
  Box,
  Button,
  Container,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { redirect } from "next/navigation";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectMongo } from "@/lib/mongoose";
import { Diagnosis } from "@/lib/models/Diagnosis";
import MemberHeader from "@/app/components/MemberHeader";
import RpgWindow from "@/app/components/RpgWindow";
import DiagnosisDisclaimer from "@/app/components/diagnosis/DiagnosisDisclaimer";
import DiagnosisResultIntro from "@/app/components/diagnosis/DiagnosisResultIntro";
import NextStepsList from "@/app/components/diagnosis/NextStepsList";
import { dqColors } from "@/app/theme";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ id?: string }> };

export default async function DiagnosisResultPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/diagnosis/result");

  const { id } = await searchParams;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    redirect("/diagnosis");
  }

  await connectMongo();
  const doc = await Diagnosis.findById(id).lean();
  if (!doc || String(doc.userId) !== session.user.id) {
    redirect("/diagnosis/history");
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <MemberHeader name={session.user.name} image={session.user.image} />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <DiagnosisResultIntro />

        <Stack spacing={2.5}>
          <RpgWindow title="つよさタイプ" className="dq-enter">
            <Typography
              sx={{
                fontFamily: "var(--font-display), DotGothic16, monospace",
                fontSize: "1.35rem",
                color: dqColors.crimson,
                mb: 2,
                letterSpacing: "0.06em",
              }}
            >
              {doc.result?.strengthType}
            </Typography>
            <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
              {doc.result?.summary}
            </Typography>
          </RpgWindow>

          <RpgWindow title="むいている しょくぎょう" className="dq-enter-delay">
            <List dense>
              {(doc.result?.suitableJobs ?? []).map((job: string) => (
                <ListItem key={job} disableGutters>
                  <ListItemText
                    primary={
                      <Typography className="dq-cursor" sx={{ color: dqColors.ink }}>
                        {job}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </RpgWindow>

          <RpgWindow title="キャリアロードマップ">
            <Typography sx={{ mb: 1.5 }}>
              <strong>みじかいみち（短期）:</strong> {doc.careerRoadmap?.shortTerm}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              <strong>なかみち（中期）:</strong> {doc.careerRoadmap?.midTerm}
            </Typography>
            <Typography>
              <strong>とおみち（長期）:</strong> {doc.careerRoadmap?.longTerm}
            </Typography>
          </RpgWindow>

          <RpgWindow title="つぎのいっぽ">
            <NextStepsList steps={doc.result?.nextSteps ?? []} />
          </RpgWindow>

          <RpgWindow title="コマンド">
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
              <Button href={`/diagnosis/${id}`} variant="contained" className="dq-cursor">
                くわしくみる
              </Button>
              <Button href="/diagnosis/history" variant="outlined">
                れきしをみる
              </Button>
              <Button href="/diagnosis" variant="outlined">
                もういちど
              </Button>
            </Stack>
          </RpgWindow>

          <DiagnosisDisclaimer />
        </Stack>
      </Container>
    </Box>
  );
}
