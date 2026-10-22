"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Button, Stack, Typography } from "@mui/material";
import { dqColors } from "@/app/theme";

const LINKS = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/analytics", label: "分析" },
  { href: "/admin/users", label: "ユーザー" },
  { href: "/admin/errors", label: "エラー" },
] as const;

export default function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <Box sx={{ minHeight: "100vh", px: { xs: 2, md: 3 }, py: 3 }}>
      <Stack
        spacing={2}
        sx={{
          maxWidth: 1200,
          mx: "auto",
          mb: 2,
          flexDirection: { xs: "column", md: "row" },
          alignItems: { md: "center" },
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-display), DotGothic16, monospace",
            color: dqColors.gold,
            letterSpacing: "0.08em",
            fontSize: { xs: "1.2rem", md: "1.5rem" },
          }}
        >
          {title}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          {LINKS.map((l) => (
            <Button
              key={l.href}
              component={Link}
              href={l.href}
              size="small"
              variant={pathname === l.href ? "contained" : "outlined"}
            >
              {l.label}
            </Button>
          ))}
          <Button component={Link} href="/dashboard" size="small" variant="text">
            会員TOP
          </Button>
        </Stack>
      </Stack>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>{children}</Box>
    </Box>
  );
}
