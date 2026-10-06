"use client";

import { Box, Container, Typography } from "@mui/material";
import CtaButton from "./CtaButton";

export default function HeroSection() {
  return (
    <Box
      component="section"
      aria-labelledby="hero-heading"
      sx={{
        background:
          "linear-gradient(165deg, #E3F2FD 0%, #F7FAFC 45%, #FFFFFF 100%)",
        py: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <Typography
          id="hero-heading"
          component="h1"
          variant="h1"
          sx={{
            fontSize: { xs: "1.85rem", sm: "2.5rem", md: "3.25rem" },
            mb: 2,
            color: "text.primary",
          }}
        >
          5問でわかる、あなたのキャリア
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            fontWeight: 400,
            fontSize: { xs: "1rem", md: "1.25rem" },
            mb: 4,
            lineHeight: 1.7,
          }}
        >
          AIがあなたに最適なキャリアロードマップを提案します
        </Typography>
        <CtaButton fullWidthOnMobile />
      </Container>
    </Box>
  );
}
