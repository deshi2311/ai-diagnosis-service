import { Box, Container, Grid, Typography } from "@mui/material";
import RpgWindow from "./RpgWindow";
import { dqColors } from "../theme";

const PROBLEMS = [
  "自分に何が向いているか分からない",
  "このままのキャリアでいいか不安",
  "何から始めればいいか分からない",
] as const;

export default function ProblemsSection() {
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
          こんなお悩みありませんか？
        </Typography>
        <Grid container spacing={3}>
          {PROBLEMS.map((title) => (
            <Grid key={title} size={{ xs: 12, sm: 6, md: 4 }}>
              <RpgWindow sx={{ height: "100%", textAlign: "center" }}>
                <Typography
                  className="dq-cursor"
                  sx={{
                    fontFamily: "var(--font-display), DotGothic16, monospace",
                    fontWeight: 400,
                    fontSize: "1.05rem",
                    color: dqColors.ink,
                    lineHeight: 1.7,
                    display: "inline-block",
                    textAlign: "left",
                  }}
                >
                  {title}
                </Typography>
              </RpgWindow>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
