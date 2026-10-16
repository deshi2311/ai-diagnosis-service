import { Box, Container, Grid, Typography } from "@mui/material";
import RpgWindow from "./RpgWindow";
import { dqColors } from "../theme";

const RESULTS = [
  "あなたの強みタイプ",
  "向いている職種の候補",
  "次の一歩としてやるべきこと",
] as const;

export default function ResultsSection() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 10 } }}>
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
          診断でわかること
        </Typography>
        <Grid container spacing={3}>
          {RESULTS.map((label, index) => (
            <Grid key={label} size={{ xs: 12, md: 4 }}>
              <RpgWindow sx={{ height: "100%" }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-display), DotGothic16, monospace",
                    color: dqColors.crimson,
                    letterSpacing: "0.12em",
                    mb: 1.5,
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </Typography>
                <Typography
                  className="dq-cursor"
                  sx={{
                    fontFamily: "var(--font-display), DotGothic16, monospace",
                    fontSize: "1.05rem",
                    color: dqColors.ink,
                  }}
                >
                  {label}
                </Typography>
              </RpgWindow>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
