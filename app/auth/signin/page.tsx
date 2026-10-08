import { Box, Container } from "@mui/material";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignInCard from "@/app/components/SignInCard";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: { xs: 8, md: 12 } }}>
      <Container maxWidth="sm">
        <SignInCard />
      </Container>
    </Box>
  );
}
