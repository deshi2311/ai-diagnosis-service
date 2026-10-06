import {
  Box,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

const RESULTS = [
  "あなたの強みタイプ",
  "向いている職種の候補",
  "次の一歩としてやるべきこと",
] as const;

export default function ResultsSection() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 10 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Typography
          component="h2"
          variant="h2"
          align="center"
          sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, mb: 5 }}
        >
          診断でわかること
        </Typography>
        <Grid container spacing={3}>
          {RESULTS.map((label, index) => (
            <Grid key={label} size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 2,
                  alignItems: "flex-start",
                  p: 3,
                  height: "100%",
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleOutlinedIcon color="primary" fontSize="small" />
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
                    {label}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
