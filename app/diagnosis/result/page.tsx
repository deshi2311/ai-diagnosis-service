import {
  Box,
  Button,
  Card,
  CardContent,
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
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <MemberHeader name={session.user.name} image={session.user.image} />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          診断結果
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          AI分析が完了しました
        </Typography>

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

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Button href={`/diagnosis/${id}`} variant="contained">
              詳細を見る
            </Button>
            <Button href="/diagnosis/history" variant="outlined">
              履歴一覧
            </Button>
            <Button href="/diagnosis" variant="text">
              もう一度診断
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
