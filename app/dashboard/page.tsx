import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import MemberHeader from "@/app/components/MemberHeader";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { name, image, email } = session.user;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <MemberHeader name={name} image={image} />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
          ダッシュボード
        </Typography>
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: 3 }}>
          <CardContent sx={{ display: "flex", gap: 2, alignItems: "center", p: 3 }}>
            <Avatar alt={name ?? "ユーザー"} src={image ?? undefined} sx={{ width: 64, height: 64 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {name ?? "ユーザー"}
              </Typography>
              <Typography color="text.secondary">{email}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                会員専用トップページです。診断の開始や履歴の確認ができます。
              </Typography>
            </Box>
          </CardContent>
        </Card>
        <Stack spacing={1} sx={{ flexDirection: { xs: "column", sm: "row" } }}>
          <Button href="/diagnosis" variant="contained">
            キャリア診断を始める
          </Button>
          <Button href="/diagnosis/history" variant="outlined">
            診断履歴を見る
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
