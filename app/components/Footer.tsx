import { Box, Typography } from "@mui/material";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        bgcolor: "#0D47A1",
        color: "rgba(255,255,255,0.9)",
        textAlign: "center",
      }}
    >
      <Typography variant="body2">
        © {year} AIキャリア診断サービス
      </Typography>
    </Box>
  );
}
