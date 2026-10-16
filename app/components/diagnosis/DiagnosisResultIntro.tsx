"use client";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import RpgTypeText from "../RpgTypeText";
import { dqColors } from "../../theme";

export default function DiagnosisResultIntro() {
  const [phase, setPhase] = useState<"title" | "sub">("title");

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        component="h1"
        sx={{
          fontFamily: "var(--font-display), DotGothic16, monospace",
          fontSize: { xs: "1.5rem", md: "1.9rem" },
          color: dqColors.gold,
          letterSpacing: "0.12em",
          mb: 1,
        }}
      >
        <RpgTypeText
          text="てんしょく せいこう！"
          msPerChar={55}
          onDone={() => setPhase("sub")}
        />
      </Typography>
      {phase === "sub" ? (
        <Typography sx={{ color: dqColors.parchment, opacity: 0.8 }}>
          <RpgTypeText text="AI分析が完了しました" msPerChar={40} />
        </Typography>
      ) : (
        <Typography sx={{ color: dqColors.parchment, opacity: 0, minHeight: "1.5em" }} aria-hidden>
          AI分析が完了しました
        </Typography>
      )}
    </Box>
  );
}
