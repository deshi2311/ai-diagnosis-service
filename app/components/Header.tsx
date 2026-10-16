"use client";

import {
  AppBar,
  Box,
  Link as MuiLink,
  Toolbar,
  Typography,
} from "@mui/material";
import CtaButton from "./CtaButton";
import HeaderAuth from "./HeaderAuth";
import { dqColors } from "../theme";

const NAV_ITEMS = [
  { label: "特徴", href: "#features" },
  { label: "診断の流れ", href: "#steps" },
  { label: "FAQ", href: "#faq" },
] as const;

export default function Header() {
  const scrollToTop = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar
        sx={{
          flexWrap: "wrap",
          gap: { xs: 1.5, md: 2 },
          py: { xs: 1.5, md: 1 },
          px: { xs: 2, md: 3 },
          maxWidth: 1200,
          width: "100%",
          mx: "auto",
          alignItems: "center",
          minHeight: { xs: "auto", md: 64 },
        }}
      >
        <Typography
          component="a"
          href="#top"
          onClick={scrollToTop}
          sx={{
            fontFamily: "var(--font-display), DotGothic16, monospace",
            color: dqColors.gold,
            textDecoration: "none",
            flexShrink: 0,
            mr: { md: "auto" },
            fontSize: { xs: "0.95rem", sm: "1.1rem" },
            letterSpacing: "0.06em",
            lineHeight: 1.3,
            maxWidth: { xs: "100%", sm: "none" },
          }}
        >
          AIキャリア診断サービス
        </Typography>

        <Box
          component="nav"
          aria-label="ページ内ナビ"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: { xs: 1.5, sm: 2.5 },
            order: { xs: 3, md: 2 },
            width: { xs: "100%", md: "auto" },
            justifyContent: { xs: "flex-start", sm: "center", md: "flex-end" },
            pb: { xs: 0.5, md: 0 },
          }}
        >
          {NAV_ITEMS.map((item) => (
            <MuiLink
              key={item.href}
              href={item.href}
              underline="hover"
              sx={{
                fontFamily: "var(--font-display), DotGothic16, monospace",
                color: dqColors.parchment,
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                letterSpacing: "0.08em",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </MuiLink>
          ))}
        </Box>

        <Box
          sx={{
            order: { xs: 2, md: 3 },
            ml: { xs: "auto", md: 0 },
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <HeaderAuth />
          <CtaButton size="medium" label="しんだん" sx={{ px: { xs: 1.5, sm: 2 }, py: 0.9 }} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
