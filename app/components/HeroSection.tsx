"use client";

import { Box, Container, Typography } from "@mui/material";
import CtaButton from "./CtaButton";
import RpgWindow from "./RpgWindow";
import RpgTypeText from "./RpgTypeText";
import { dqColors } from "../theme";

export default function HeroSection() {
  return (
    <Box
      component="section"
      aria-labelledby="hero-heading"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: { xs: 8, md: 12 },
        minHeight: { xs: "78vh", md: "82vh" },
        display: "flex",
        alignItems: "center",
        background: `
          radial-gradient(ellipse 90% 60% at 50% 0%, #3a5f8a 0%, transparent 55%),
          linear-gradient(180deg, #1a3a5c 0%, ${dqColors.navy} 55%, #071018 100%)
        `,
      }}
    >
      <Box className="dq-stars" aria-hidden />
      <Box className="dq-hills" aria-hidden />
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <RpgWindow className="dq-enter" sx={{ textAlign: "center" }}>
          <Typography
            id="hero-heading"
            component="h1"
            sx={{
              fontFamily: "var(--font-display), DotGothic16, monospace",
              fontSize: { xs: "1.55rem", sm: "2.1rem", md: "2.6rem" },
              letterSpacing: "0.06em",
              color: dqColors.ink,
              mb: 2,
              lineHeight: 1.45,
            }}
          >
            5問でわかる、あなたのキャリア
          </Typography>
          <Typography
            component="div"
            sx={{
              fontFamily: "var(--font-display), DotGothic16, monospace",
              color: dqColors.inkMuted,
              fontSize: { xs: "0.95rem", md: "1.15rem" },
              mb: 1,
              letterSpacing: "0.12em",
              minHeight: "1.6em",
            }}
          >
            <RpgTypeText text="つぎの しょくぎょうを えらべ" msPerChar={55} />
          </Typography>
          <Typography
            sx={{
              color: dqColors.inkMuted,
              mb: 3.5,
              lineHeight: 1.8,
              fontSize: { xs: "0.95rem", md: "1.05rem" },
            }}
          >
            AIがあなたに最適なキャリアロードマップを提案します
          </Typography>
          <CtaButton fullWidthOnMobile />
        </RpgWindow>
      </Container>
    </Box>
  );
}
