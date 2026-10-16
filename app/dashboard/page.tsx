import {
  Avatar,
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import MemberHeader from "@/app/components/MemberHeader";
import RpgWindow from "@/app/components/RpgWindow";
import { dqColors } from "@/app/theme";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { name, image, email } = session.user;

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <MemberHeader name={name} image={image} />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display), DotGothic16, monospace",
            fontSize: { xs: "1.4rem", md: "1.75rem" },
            color: dqColors.gold,
            letterSpacing: "0.1em",
            mb: 3,
          }}
        >
          ダッシュボード
        </Typography>
        <RpgWindow className="dq-enter" sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Avatar
              alt={name ?? "ユーザー"}
              src={image ?? undefined}
              sx={{
                width: 64,
                height: 64,
                borderRadius: 0,
                border: `2px solid ${dqColors.gold}`,
              }}
            />
            <Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-display), DotGothic16, monospace",
                  fontSize: "1.15rem",
                  color: dqColors.ink,
                }}
              >
                {name ?? "ユーザー"}
              </Typography>
              <Typography sx={{ color: dqColors.inkMuted }}>{email}</Typography>
              <Typography sx={{ color: dqColors.inkMuted, mt: 1, lineHeight: 1.7 }}>
                会員専用トップ。診断の開始や履歴の確認ができます。
              </Typography>
            </Box>
          </Box>
        </RpgWindow>
        <RpgWindow title="コマンド">
          <Stack spacing={1} sx={{ flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
            <Button href="/diagnosis" variant="contained" className="dq-cursor">
              しんだんをはじめる
            </Button>
            <Button href="/diagnosis/history" variant="outlined">
              れきしをみる
            </Button>
          </Stack>
        </RpgWindow>
      </Container>
    </Box>
  );
}
