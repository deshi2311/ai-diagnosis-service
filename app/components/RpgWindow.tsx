import { Box, Typography, type BoxProps } from "@mui/material";
import { dqColors } from "../theme";

type RpgWindowProps = BoxProps & {
  title?: string;
  tone?: "parchment" | "night";
};

export default function RpgWindow({
  title,
  tone = "parchment",
  children,
  sx,
  ...rest
}: RpgWindowProps) {
  const isNight = tone === "night";

  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: isNight ? dqColors.navyMid : dqColors.parchment,
        color: isNight ? dqColors.parchment : dqColors.ink,
        border: `3px solid ${dqColors.gold}`,
        boxShadow: `
          0 0 0 2px ${dqColors.navy},
          0 0 0 5px ${dqColors.goldDark},
          8px 8px 0 rgba(0, 0, 0, 0.35)
        `,
        borderRadius: 0,
        p: { xs: 2.5, md: 3.5 },
        ...sx,
      }}
      {...rest}
    >
      {title ? (
        <Typography
          component="h2"
          sx={{
            fontFamily: "var(--font-display), DotGothic16, monospace",
            letterSpacing: "0.08em",
            mb: 2,
            pb: 1,
            borderBottom: `2px solid ${dqColors.goldDark}`,
            color: isNight ? dqColors.gold : dqColors.ink,
            fontSize: { xs: "1.05rem", md: "1.2rem" },
          }}
        >
          {title}
        </Typography>
      ) : null}
      {children}
    </Box>
  );
}
