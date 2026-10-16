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
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        py: { xs: 8, md: 12 },
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box className="dq-stars" aria-hidden />
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <SignInCard />
      </Container>
    </Box>
  );
}
