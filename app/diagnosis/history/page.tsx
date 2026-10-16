import {
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

export const dynamic = "force-dynamic";

export default async function DiagnosisHistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/diagnosis/history");

  await connectMongo();
  const items = await Diagnosis.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <Box sx={{ minHeight: "100vh" }}>
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
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-display), DotGothic16, monospace",
              fontSize: { xs: "1.4rem", md: "1.75rem" },
              color: dqColors.gold,
              letterSpacing: "0.1em",
            }}
          >
            これまでの冒険の書
          </Typography>
          <Button href="/diagnosis" variant="contained" className="dq-cursor">
            あたらしいしんだん
          </Button>
        </Stack>

        {items.length === 0 ? (
          <RpgWindow>
            <Typography sx={{ color: dqColors.inkMuted, mb: 2 }}>
              まだ診断結果がありません
            </Typography>
            <Button href="/diagnosis" variant="outlined" className="dq-cursor">
              しんだんをはじめる
            </Button>
          </RpgWindow>
        ) : (
          <Stack spacing={2}>
            {items.map((item) => (
              <Box
                key={String(item._id)}
                component={Link}
                href={`/diagnosis/${String(item._id)}`}
                sx={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <RpgWindow
                  sx={{
                    transition: "transform 0.15s ease",
                    "&:hover": { transform: "translateY(-2px)" },
                    cursor: "pointer",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "var(--font-display), DotGothic16, monospace",
                      color: dqColors.crimson,
                      letterSpacing: "0.06em",
                      mb: 1,
                    }}
                  >
                    {item.result?.strengthType || "診断結果"}
                  </Typography>
                  <Typography sx={{ mb: 1, color: dqColors.ink }}>
                    {item.result?.summary || "要約なし"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: dqColors.inkMuted }}>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString("ja-JP")
                      : ""}
                  </Typography>
                </RpgWindow>
              </Box>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
