import {
  Avatar,
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectMongo } from "@/lib/mongoose";
import { Diagnosis } from "@/lib/models/Diagnosis";
import MemberHeader from "@/app/components/MemberHeader";
import RpgWindow from "@/app/components/RpgWindow";
import { dqColors } from "@/app/theme";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { name, image, email, id, role } = session.user;
  await connectMongo();
  const items = id
    ? await Diagnosis.find({ userId: new mongoose.Types.ObjectId(id) })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id result.strengthType result.summary createdAt")
        .lean()
    : [];

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <MemberHeader name={name} image={image} role={role} />
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

        <RpgWindow title="さいきんの しんだん" sx={{ mb: 3 }}>
          {items.length === 0 ? (
            <Typography sx={{ color: dqColors.inkMuted, mb: 2 }}>
              まだ診断結果がありません
            </Typography>
          ) : (
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              {items.map((item) => (
                <Box
                  key={String(item._id)}
                  component={Link}
                  href={`/diagnosis/${String(item._id)}`}
                  sx={{ textDecoration: "none", color: "inherit", display: "block" }}
                >
                  <Typography sx={{ color: dqColors.crimson, fontFamily: "var(--font-display), DotGothic16, monospace" }}>
                    {item.result?.strengthType || "診断結果"}
                  </Typography>
                  <Typography sx={{ fontSize: "0.9rem" }}>
                    {(item.result?.summary || "").slice(0, 80)}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: dqColors.inkMuted }}>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString("ja-JP")
                      : ""}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
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
