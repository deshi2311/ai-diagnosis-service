import { Box, Typography } from "@mui/material";
import { dqColors } from "../theme";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        bgcolor: "#050d16",
        borderTop: `3px solid ${dqColors.gold}`,
        color: dqColors.parchment,
        textAlign: "center",
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontFamily: "var(--font-display), DotGothic16, monospace",
          letterSpacing: "0.08em",
          opacity: 0.85,
        }}
      >
        © {year} AIキャリア診断サービス
      </Typography>
    </Box>
  );
}
