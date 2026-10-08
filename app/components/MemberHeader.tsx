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

type MemberHeaderProps = {
  name?: string | null;
  image?: string | null;
};

export default function MemberHeader({ name, image }: MemberHeaderProps) {
  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
    >
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
          variant="h6"
          sx={{
            fontWeight: 800,
            color: "primary.main",
            textDecoration: "none",
            mr: "auto",
            fontSize: { xs: "1rem", sm: "1.15rem" },
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
            sx={{ width: 36, height: 36 }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
