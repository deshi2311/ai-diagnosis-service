import { Box, Container, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import MemberHeader from "@/app/components/MemberHeader";
import ProfileForm from "@/app/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <MemberHeader name={session.user.name} image={session.user.image} />
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
          プロフィール
        </Typography>
        <ProfileForm />
      </Container>
    </Box>
  );
}
