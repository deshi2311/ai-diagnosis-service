"use client";

import { signIn } from "next-auth/react";
import { Button, Typography, Box } from "@mui/material";
import RpgWindow from "./RpgWindow";
import { dqColors } from "../theme";

export default function SignInCard() {
  return (
    <RpgWindow className="dq-enter" sx={{ maxWidth: 440, mx: "auto", textAlign: "center" }}>
      <Typography
        component="h1"
        sx={{
          fontFamily: "var(--font-display), DotGothic16, monospace",
          fontSize: "1.4rem",
          letterSpacing: "0.1em",
          mb: 1,
          color: dqColors.ink,
        }}
      >
        ぼうけんのしょ
      </Typography>
      <Typography sx={{ color: dqColors.inkMuted, mb: 3, lineHeight: 1.8 }}>
        Googleアカウントでログインし、キャリア診断を始めましょう
      </Typography>
      <Button
        variant="contained"
        size="large"
        fullWidth
        className="dq-cursor"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        sx={{ py: 1.25 }}
      >
        Googleでログイン
      </Button>
      <Box sx={{ mt: 2 }}>
        <Button href="/" variant="text" size="small">
          トップへ戻る
        </Button>
      </Box>
    </RpgWindow>
  );
}
