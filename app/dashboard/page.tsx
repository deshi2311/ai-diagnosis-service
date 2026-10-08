import { Avatar, Box, Card, CardContent, Container, Typography } from "@mui/material";
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
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ display: "flex", gap: 2, alignItems: "center", p: 3 }}>
            <Avatar alt={name ?? "ユーザー"} src={image ?? undefined} sx={{ width: 64, height: 64 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {name ?? "ユーザー"}
              </Typography>
              <Typography color="text.secondary">{email}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                会員専用トップページです。プロフィールの確認・編集ができます。
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
