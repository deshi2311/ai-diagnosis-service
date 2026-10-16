"use client";

import { Button, type ButtonProps } from "@mui/material";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type CtaButtonProps = Omit<ButtonProps, "onClick" | "children"> & {
  fullWidthOnMobile?: boolean;
  label?: string;
};

export default function CtaButton({
  fullWidthOnMobile = false,
  label = "じんせいを すすめる",
  sx,
  size = "large",
  ...rest
}: CtaButtonProps) {
  const router = useRouter();
  const { status } = useSession();

  const onClick = () => {
    if (status === "authenticated") {
      router.push("/diagnosis");
      return;
    }
    router.push("/auth/signin?callbackUrl=/diagnosis");
  };

  return (
    <Button
      variant="contained"
      size={size}
      onClick={onClick}
      className="dq-cursor"
      aria-label="無料で診断を始める"
      sx={{
        py: 1.35,
        fontSize: { xs: "0.95rem", sm: "1.05rem" },
        whiteSpace: "nowrap",
        ...(fullWidthOnMobile ? { width: { xs: "100%", sm: "auto" } } : {}),
        ...sx,
      }}
      {...rest}
    >
      {label}
    </Button>
  );
}
