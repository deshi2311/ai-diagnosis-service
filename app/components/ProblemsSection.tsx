import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import ExploreOffIcon from "@mui/icons-material/ExploreOff";

const PROBLEMS = [
  {
    title: "自分に何が向いているか分からない",
    icon: <HelpOutlinedIcon color="primary" sx={{ fontSize: 40 }} />,
  },
  {
    title: "このままのキャリアでいいか不安",
    icon: <TrendingFlatIcon color="primary" sx={{ fontSize: 40 }} />,
  },
  {
    title: "何から始めればいいか分からない",
    icon: <ExploreOffIcon color="primary" sx={{ fontSize: 40 }} />,
  },
] as const;

export default function ProblemsSection() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 10 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Typography
          component="h2"
          variant="h2"
          align="center"
          sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, mb: 5 }}
        >
          こんなお悩みありませんか？
        </Typography>
        <Grid container spacing={3}>
          {PROBLEMS.map((item) => (
            <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 2,
                    p: 3,
                  }}
                >
                  {item.icon}
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
                    {item.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
