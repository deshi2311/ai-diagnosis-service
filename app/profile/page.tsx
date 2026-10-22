import { Box, Container, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import MemberHeader from "@/app/components/MemberHeader";
import ProfileForm from "@/app/components/ProfileForm";
import RpgWindow from "@/app/components/RpgWindow";
import { dqColors } from "@/app/theme";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <MemberHeader
        name={session.user.name}
        image={session.user.image}
        role={session.user.role}
      />
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
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
          プロフィール
        </Typography>
        <RpgWindow>
          <ProfileForm />
        </RpgWindow>
      </Container>
    </Box>
  );
}
