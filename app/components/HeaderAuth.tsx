"use client";

import Link from "next/link";
import { Avatar, Button, Skeleton } from "@mui/material";
import { useSession } from "next-auth/react";

export default function HeaderAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Skeleton variant="rounded" width={88} height={36} />;
  }

  if (session?.user) {
    return (
      <Button
        href="/dashboard"
        variant="outlined"
        size="small"
        startIcon={
          <Avatar
            alt={session.user.name ?? "ユーザー"}
            src={session.user.image ?? undefined}
            sx={{ width: 24, height: 24 }}
          />
        }
        sx={{ whiteSpace: "nowrap" }}
      >
        マイページ
      </Button>
    );
  }

  return (
    <Button
      component={Link}
      href="/auth/signin"
      variant="outlined"
      size="small"
      sx={{ whiteSpace: "nowrap" }}
    >
      ログイン
    </Button>
  );
}
