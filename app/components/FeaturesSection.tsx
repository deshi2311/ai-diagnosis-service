import { Box, Container, Grid, Typography } from "@mui/material";
import RpgWindow from "./RpgWindow";
import { dqColors } from "../theme";

const FEATURES = [
  {
    title: "たった5問・3分で完了",
    description: "忙しい方でもスキマ時間で診断できます。長い自己分析は不要です。",
  },
  {
    title: "AIが深く分析",
    description: "回答をもとにAIが傾向を読み取り、キャリアの方向性を整理します。",
  },
  {
    title: "パーソナライズされた提案",
    description: "あなた向けのキャリアロードマップとして、次の一歩まで具体化します。",
  },
] as const;

export default function FeaturesSection() {
  return (
    <Box
      component="section"
      id="features"
      sx={{ py: { xs: 8, md: 10 }, scrollMarginTop: 16 }}
    >
      <Container maxWidth="lg">
        <Typography
          component="h2"
          align="center"
          sx={{
            fontFamily: "var(--font-display), DotGothic16, monospace",
            fontSize: { xs: "1.35rem", md: "1.85rem" },
            color: dqColors.gold,
            letterSpacing: "0.1em",
            mb: 1.5,
          }}
        >
          サービスの特徴
        </Typography>
        <Typography
          align="center"
          sx={{ mb: 5, maxWidth: 560, mx: "auto", color: dqColors.parchment, opacity: 0.85 }}
        >
          短時間で、あなたに合ったキャリアの手がかりが得られます
        </Typography>
        <Grid container spacing={3}>
          {FEATURES.map((item) => (
            <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <RpgWindow title={item.title} sx={{ height: "100%" }}>
                <Typography sx={{ lineHeight: 1.8, color: dqColors.inkMuted }}>
                  {item.description}
                </Typography>
              </RpgWindow>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
