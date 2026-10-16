import { createTheme } from "@mui/material/styles";

/** DQ風メニュー美学（公式IP非使用） */
const parchment = "#F3E6C8";
const parchmentDeep = "#E8D7A8";
const navy = "#0B1A2E";
const navyMid = "#142845";
const gold = "#D4AF37";
const goldDark = "#8B6914";
const crimson = "#B33A3A";
const ink = "#1C1810";
const inkMuted = "#5C5346";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: crimson,
      light: "#D45A5A",
      dark: "#8E2A2A",
      contrastText: "#FFF8E7",
    },
    secondary: {
      main: gold,
      light: "#E8D48B",
      dark: goldDark,
      contrastText: navy,
    },
    background: {
      default: navy,
      paper: parchment,
    },
    text: {
      primary: ink,
      secondary: inkMuted,
    },
    divider: goldDark,
    error: {
      main: "#9C2B2B",
    },
  },
  typography: {
    fontFamily: [
      "var(--font-body)",
      '"Zen Maru Gothic"',
      '"Hiragino Maru Gothic ProN"',
      "Meiryo",
      "sans-serif",
    ].join(","),
    h1: {
      fontFamily: "var(--font-display), DotGothic16, monospace",
      fontWeight: 400,
      letterSpacing: "0.04em",
      color: parchment,
    },
    h2: {
      fontFamily: "var(--font-display), DotGothic16, monospace",
      fontWeight: 400,
      letterSpacing: "0.04em",
    },
    h3: {
      fontFamily: "var(--font-display), DotGothic16, monospace",
      fontWeight: 400,
      letterSpacing: "0.03em",
    },
    h4: {
      fontFamily: "var(--font-display), DotGothic16, monospace",
      fontWeight: 400,
      letterSpacing: "0.03em",
    },
    h5: {
      fontFamily: "var(--font-display), DotGothic16, monospace",
      fontWeight: 400,
      letterSpacing: "0.02em",
    },
    h6: {
      fontFamily: "var(--font-display), DotGothic16, monospace",
      fontWeight: 400,
      letterSpacing: "0.02em",
    },
    button: {
      textTransform: "none",
      fontFamily: "var(--font-display), DotGothic16, monospace",
      fontWeight: 400,
      letterSpacing: "0.06em",
    },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: navy,
          backgroundImage: `
            radial-gradient(ellipse 120% 80% at 50% -10%, #1e3a5f 0%, transparent 55%),
            linear-gradient(180deg, ${navy} 0%, ${navyMid} 45%, #0a1420 100%)
          `,
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `2px solid ${gold}`,
          boxShadow: `inset 0 0 0 1px ${goldDark}`,
          paddingLeft: 20,
          paddingRight: 20,
        },
        contained: {
          background: `linear-gradient(180deg, #C94A4A 0%, ${crimson} 55%, #8E2A2A 100%)`,
          color: "#FFF8E7",
          "&:hover": {
            background: `linear-gradient(180deg, #D45A5A 0%, #C44536 55%, ${crimson} 100%)`,
          },
        },
        outlined: {
          backgroundColor: parchment,
          color: ink,
          borderColor: gold,
          "&:hover": {
            backgroundColor: parchmentDeep,
            borderColor: gold,
          },
        },
        text: {
          border: "none",
          boxShadow: "none",
          color: gold,
          "&:hover": {
            backgroundColor: "rgba(212, 175, 55, 0.12)",
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: parchment,
          border: `3px solid ${gold}`,
          boxShadow: `
            0 0 0 2px ${navy},
            0 0 0 5px ${goldDark},
            6px 6px 0 rgba(0, 0, 0, 0.35)
          `,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 0,
            backgroundColor: "#FFF8E7",
            "& fieldset": {
              borderColor: goldDark,
              borderWidth: 2,
            },
            "&:hover fieldset": {
              borderColor: gold,
            },
            "&.Mui-focused fieldset": {
              borderColor: gold,
            },
          },
          "& .MuiInputLabel-root": {
            color: inkMuted,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: navyMid,
          color: parchment,
          borderBottom: `3px solid ${gold}`,
          boxShadow: `0 3px 0 ${goldDark}`,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: gold,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: "0 !important",
          backgroundColor: parchment,
          border: `3px solid ${gold}`,
          boxShadow: `0 0 0 2px ${navy}, 0 0 0 4px ${goldDark}`,
          "&:before": { display: "none" },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `2px solid ${goldDark}`,
        },
      },
    },
  },
});

export const dqColors = {
  parchment,
  parchmentDeep,
  navy,
  navyMid,
  gold,
  goldDark,
  crimson,
  ink,
  inkMuted,
} as const;

export default theme;
