"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { dqColors } from "../theme";

const FAQS = [
  {
    question: "診断は無料ですか？",
    answer: "無料です",
  },
  {
    question: "どれくらい時間がかかりますか？",
    answer: "約3分です",
  },
  {
    question: "会員登録は必要ですか？",
    answer: "Googleアカウントでのログインが必要です",
  },
] as const;

export default function FaqSection() {
  return (
    <Box
      component="section"
      id="faq"
      sx={{ py: { xs: 8, md: 10 }, scrollMarginTop: 16 }}
    >
      <Container maxWidth="md">
        <Typography
          component="h2"
          align="center"
          sx={{
            fontFamily: "var(--font-display), DotGothic16, monospace",
            fontSize: { xs: "1.35rem", md: "1.85rem" },
            color: dqColors.gold,
            letterSpacing: "0.1em",
            mb: 4,
          }}
        >
          よくある質問
        </Typography>
        {FAQS.map((item) => (
          <Accordion key={item.question} disableGutters elevation={0} sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: dqColors.goldDark }} />}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-display), DotGothic16, monospace",
                  color: dqColors.ink,
                  letterSpacing: "0.04em",
                }}
              >
                {`Q. ${item.question}`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ color: dqColors.inkMuted, lineHeight: 1.8 }}>
                {`A. ${item.answer}`}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}
