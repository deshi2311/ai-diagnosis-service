import {
  Box,
  Container,
  Grid,
  Typography,
} from "@mui/material";

const STEPS = [
  { step: 1, title: "質問に回答", description: "シンプルな5問に答えるだけです。" },
  { step: 2, title: "AI分析", description: "回答内容をもとにAIが傾向を分析します。" },
  { step: 3, title: "結果表示", description: "キャリアロードマップとして結果を確認できます。" },
] as const;

export default function StepsSection() {
  return (
    <Box
      component="section"
      id="steps"
      sx={{ py: { xs: 8, md: 10 }, bgcolor: "background.paper", scrollMarginTop: 16 }}
    >
      <Container maxWidth="lg">
        <Typography
          component="h2"
          variant="h2"
          align="center"
          sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, mb: 5 }}
        >
          診断の流れ
        </Typography>
        <Grid container spacing={3}>
          {STEPS.map((item) => (
            <Grid key={item.step} size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 3,
                  height: "100%",
                  borderRadius: 3,
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  sx={{
                    display: "inline-block",
                    px: 2,
                    py: 0.5,
                    mb: 2,
                    borderRadius: 999,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                  }}
                >
                  Step {item.step}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography color="text.secondary">{item.description}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
