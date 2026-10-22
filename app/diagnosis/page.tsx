import { Box, Container, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import MemberHeader from "@/app/components/MemberHeader";
import DiagnosisForm from "@/app/components/diagnosis/DiagnosisForm";
import AnalyticsTracker from "@/app/components/analytics/AnalyticsTracker";
import { dqColors } from "@/app/theme";

export const dynamic = "force-dynamic";

export default async function DiagnosisPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/diagnosis");

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AnalyticsTracker event="diagnosis_started" />
      <MemberHeader
        name={session.user.name}
        image={session.user.image}
        role={session.user.role}
      />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display), DotGothic16, monospace",
            fontSize: { xs: "1.4rem", md: "1.75rem" },
            color: dqColors.gold,
            letterSpacing: "0.1em",
            mb: 3,
          }}
        >
          AIキャリア診断
        </Typography>
        <DiagnosisForm />
      </Container>
    </Box>
  );
}
