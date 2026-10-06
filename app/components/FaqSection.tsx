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
    answer: "現在は不要です（今後追加予定）",
  },
] as const;

export default function FaqSection() {
  return (
    <Box
      component="section"
      id="faq"
      sx={{ py: { xs: 8, md: 10 }, bgcolor: "background.default", scrollMarginTop: 16 }}
    >
      <Container maxWidth="md">
        <Typography
          component="h2"
          variant="h2"
          align="center"
          sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, mb: 5 }}
        >
          よくある質問
        </Typography>
        {FAQS.map((item) => (
          <Accordion
            key={item.question}
            disableGutters
            elevation={0}
            sx={{
              mb: 1.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "12px !important",
              "&:before": { display: "none" },
              overflow: "hidden",
              bgcolor: "background.paper",
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 700 }}>
                {`Q. ${item.question}`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                {`A. ${item.answer}`}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}
