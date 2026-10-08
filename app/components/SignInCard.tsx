"use client";

import { signIn } from "next-auth/react";
import { Button, Card, CardContent, Typography, Box } from "@mui/material";

export default function SignInCard() {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", maxWidth: 420, mx: "auto" }}>
      <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          ログイン
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Googleアカウントで会員機能を利用できます
        </Typography>
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          sx={{
            py: 1.25,
            fontWeight: 700,
            background: "linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #0D47A1 0%, #1E88E5 100%)",
            },
          }}
        >
          Googleでログイン
        </Button>
      </CardContent>
      <Box sx={{ px: 3, pb: 3, textAlign: "center" }}>
        <Button href="/" variant="text" size="small">
          トップへ戻る
        </Button>
      </Box>
    </Card>
  );
}
