"use client";

import { Button, type ButtonProps } from "@mui/material";
import { useCta } from "./CtaProvider";

type CtaButtonProps = Omit<ButtonProps, "onClick" | "children"> & {
  fullWidthOnMobile?: boolean;
};

export default function CtaButton({
  fullWidthOnMobile = false,
  sx,
  size = "large",
  ...rest
}: CtaButtonProps) {
  const { onCtaClick } = useCta();

  return (
    <Button
      variant="contained"
      size={size}
      onClick={onCtaClick}
      disableElevation
      sx={{
        px: 3,
        py: 1.25,
        fontWeight: 700,
        borderRadius: 2,
        background: "linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)",
        color: "#fff",
        whiteSpace: "nowrap",
        "&:hover": {
          background: "linear-gradient(135deg, #0D47A1 0%, #1E88E5 100%)",
        },
        ...(fullWidthOnMobile
          ? { width: { xs: "100%", sm: "auto" } }
          : {}),
        ...sx,
      }}
      {...rest}
    >
      無料で診断を始める
    </Button>
  );
}
