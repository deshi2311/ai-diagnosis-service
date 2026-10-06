"use client";

import { Box, Container, Typography } from "@mui/material";
import CtaButton from "./CtaButton";

export default function CtaSection() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 10 },
        background: "linear-gradient(135deg, #1565C0 0%, #1E88E5 55%, #42A5F5 100%)",
        color: "#fff",
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <Typography
          component="h2"
          variant="h2"
          sx={{
            fontSize: { xs: "1.5rem", md: "2.25rem" },
            mb: 4,
            color: "#fff",
          }}
        >
          さあ、あなたのキャリアを見つけよう
        </Typography>
        <CtaButton
          fullWidthOnMobile
          sx={{
            background: "#FFFFFF",
            color: "primary.main",
            "&:hover": {
              background: "#E3F2FD",
            },
          }}
        />
      </Container>
    </Box>
  );
}
