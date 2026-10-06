import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1565C0",
      light: "#42A5F5",
      dark: "#0D47A1",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#0277BD",
    },
    background: {
      default: "#F7FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A2027",
      secondary: "#5A6A7A",
    },
  },
  typography: {
    fontFamily: [
      '"Noto Sans JP"',
      '"Hiragino Sans"',
      '"Hiragino Kaku Gothic ProN"',
      "Meiryo",
      "sans-serif",
    ].join(","),
    h1: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 700,
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;
