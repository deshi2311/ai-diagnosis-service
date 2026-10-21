import { Typography } from "@mui/material";
import { dqColors } from "@/app/theme";

const DISCLAIMER =
  "AIによる参考提案であり、適性や就職を保証するものではありません";

export default function DiagnosisDisclaimer() {
  return (
    <Typography
      component="p"
      sx={{
        mt: 1,
        color: dqColors.parchment,
        opacity: 0.75,
        fontSize: "0.85rem",
        lineHeight: 1.7,
        letterSpacing: "0.02em",
      }}
    >
      {DISCLAIMER}
    </Typography>
  );
}
