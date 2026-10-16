import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectMongo } from "@/lib/mongoose";
import { Diagnosis } from "@/lib/models/Diagnosis";
import MemberHeader from "@/app/components/MemberHeader";

export const dynamic = "force-dynamic";

export default async function DiagnosisHistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/diagnosis/history");

  await connectMongo();
  const items = await Diagnosis.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

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
            alignItems: { xs: "flex-start", sm: "center" },
          }}
        >
          <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>
            診断履歴
          </Typography>
          <Button href="/diagnosis" variant="contained">
            新しい診断
          </Button>
        </Stack>

        {items.length === 0 ? (
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                まだ診断結果がありません
              </Typography>
              <Button href="/diagnosis" variant="outlined">
                診断を始める
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {items.map((item) => (
              <Card
                key={String(item._id)}
                elevation={0}
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <CardActionArea href={`/diagnosis/${String(item._id)}`}>
                  <CardContent>
                    <Typography variant="overline" color="primary">
                      {item.result?.strengthType || "診断結果"}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      {item.result?.summary || "要約なし"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString("ja-JP")
                        : ""}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
