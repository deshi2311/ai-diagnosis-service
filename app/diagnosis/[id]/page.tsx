import {
  Box,
  Card,
  CardContent,
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
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <MemberHeader name={session.user.name} image={session.user.image} />
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
            <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>
              診断結果詳細
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {doc.createdAt
                ? new Date(doc.createdAt).toLocaleString("ja-JP")
                : ""}
            </Typography>
          </Box>
          <DiagnosisDetailActions id={id} />
        </Stack>

        <Stack spacing={2}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="overline" color="primary">
                強みタイプ
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                {doc.result?.strengthType}
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {doc.result?.summary}
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                向いている職種
              </Typography>
              <List dense>
                {(doc.result?.suitableJobs ?? []).map((job: string) => (
                  <ListItem key={job} disableGutters>
                    <ListItemText primary={job} />
                  </ListItem>
                ))}
              </List>
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                次の一歩
              </Typography>
              <List dense>
                {(doc.result?.nextSteps ?? []).map((step: string) => (
                  <ListItem key={step} disableGutters>
                    <ListItemText primary={step} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                キャリアロードマップ
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <strong>短期:</strong> {doc.careerRoadmap?.shortTerm}
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <strong>中期:</strong> {doc.careerRoadmap?.midTerm}
              </Typography>
              <Typography>
                <strong>長期:</strong> {doc.careerRoadmap?.longTerm}
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                あなたの回答
              </Typography>
              <Stack spacing={1.5}>
                {DIAGNOSIS_QUESTIONS.map((q, i) => (
                  <Box key={q.id}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Q{i + 1}. {q.label}
                    </Typography>
                    <Typography>{doc.answers?.[q.id]}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
