import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

const FEATURES = [
  {
    title: "たった5問・3分で完了",
    description: "忙しい方でもスキマ時間で診断できます。長い自己分析は不要です。",
    icon: <TimerOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />,
  },
  {
    title: "AIが深く分析",
    description: "回答をもとにAIが傾向を読み取り、キャリアの方向性を整理します。",
    icon: <PsychologyOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />,
  },
  {
    title: "パーソナライズされた提案",
    description: "あなた向けのキャリアロードマップとして、次の一歩まで具体化します。",
    icon: <AutoAwesomeOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />,
  },
] as const;

export default function FeaturesSection() {
  return (
    <Box
      component="section"
      id="features"
      sx={{ py: { xs: 8, md: 10 }, bgcolor: "background.paper", scrollMarginTop: 16 }}
    >
      <Container maxWidth="lg">
        <Typography
          component="h2"
          variant="h2"
          align="center"
          sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, mb: 1.5 }}
        >
          サービスの特徴
        </Typography>
        <Typography
          align="center"
          color="text.secondary"
          sx={{ mb: 5, maxWidth: 560, mx: "auto" }}
        >
          短時間で、あなたに合ったキャリアの手がかりが得られます
        </Typography>
        <Grid container spacing={3}>
          {FEATURES.map((item) => (
            <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.default",
                }}
              >
                <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {item.icon}
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {item.description}
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
