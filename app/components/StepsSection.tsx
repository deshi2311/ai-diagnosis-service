import { Box, Container, Grid, Typography } from "@mui/material";
import RpgWindow from "./RpgWindow";
import { dqColors } from "../theme";

const STEPS = [
  { step: 1, title: "質問に回答", description: "シンプルな5問に答えるだけです。" },
  { step: 2, title: "AI分析", description: "回答内容をもとにAIが傾向を分析します。" },
  { step: 3, title: "結果表示", description: "キャリアロードマップとして結果を確認できます。" },
] as const;

export default function StepsSection() {
  return (
    <Box
      component="section"
      id="steps"
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
            mb: 4,
          }}
        >
          診断の流れ
        </Typography>
        <Grid container spacing={3}>
          {STEPS.map((item) => (
            <Grid key={item.step} size={{ xs: 12, md: 4 }}>
              <RpgWindow sx={{ height: "100%", textAlign: "center" }}>
                <Typography
                  sx={{
                    display: "inline-block",
                    px: 2,
                    py: 0.5,
                    mb: 2,
                    border: `2px solid ${dqColors.gold}`,
                    bgcolor: dqColors.navyMid,
                    color: dqColors.gold,
                    fontFamily: "var(--font-display), DotGothic16, monospace",
                    letterSpacing: "0.12em",
                    fontSize: "0.85rem",
                  }}
                >
                  Step {item.step}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-display), DotGothic16, monospace",
                    mb: 1,
                    fontSize: "1.1rem",
                    color: dqColors.ink,
                  }}
                >
                  {item.title}
                </Typography>
                <Typography sx={{ color: dqColors.inkMuted, lineHeight: 1.7 }}>
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
