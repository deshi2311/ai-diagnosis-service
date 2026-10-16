"use client";

import { signOut } from "next-auth/react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Toolbar,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { dqColors } from "../theme";

type MemberHeaderProps = {
  name?: string | null;
  image?: string | null;
};

export default function MemberHeader({ name, image }: MemberHeaderProps) {
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar
        sx={{
          gap: 2,
          flexWrap: "wrap",
          maxWidth: 1200,
          width: "100%",
          mx: "auto",
          px: { xs: 2, md: 3 },
        }}
      >
        <Typography
          component={Link}
          href="/"
          sx={{
            fontFamily: "var(--font-display), DotGothic16, monospace",
            color: dqColors.gold,
            textDecoration: "none",
            mr: "auto",
            fontSize: { xs: "0.95rem", sm: "1.1rem" },
            letterSpacing: "0.06em",
          }}
        >
          AIキャリア診断サービス
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
          <Button href="/" variant="text" size="small">
            トップ
          </Button>
          <Button href="/dashboard" variant="text" size="small">
            ダッシュボード
          </Button>
          <Button href="/diagnosis" variant="text" size="small">
            診断
          </Button>
          <Button href="/diagnosis/history" variant="text" size="small">
            履歴
          </Button>
          <Button href="/profile" variant="text" size="small">
            プロフィール
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            ログアウト
          </Button>
          <Avatar
            alt={name ?? "ユーザー"}
            src={image ?? undefined}
            sx={{
              width: 36,
              height: 36,
              border: `2px solid ${dqColors.gold}`,
              borderRadius: 0,
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
