"use client";

import { Box, Container, Typography } from "@mui/material";
import CtaButton from "./CtaButton";
import RpgWindow from "./RpgWindow";
import { dqColors } from "../theme";

export default function CtaSection() {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: { xs: 8, md: 10 },
        background: `linear-gradient(180deg, ${dqColors.navyMid} 0%, #071018 100%)`,
      }}
    >
      <Box className="dq-stars" aria-hidden />
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <RpgWindow sx={{ textAlign: "center" }}>
          <Typography
            component="h2"
            sx={{
              fontFamily: "var(--font-display), DotGothic16, monospace",
              fontSize: { xs: "1.35rem", md: "1.85rem" },
              color: dqColors.ink,
              letterSpacing: "0.08em",
              mb: 3,
              lineHeight: 1.6,
            }}
          >
            さあ、あなたのキャリアを見つけよう
          </Typography>
          <CtaButton fullWidthOnMobile />
        </RpgWindow>
      </Container>
    </Box>
  );
}
