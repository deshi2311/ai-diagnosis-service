import { Box, Container } from "@mui/material";
import { redirect, notFound } from "next/navigation";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectMongo } from "@/lib/mongoose";
import { Diagnosis } from "@/lib/models/Diagnosis";
import MemberHeader from "@/app/components/MemberHeader";
import DiagnosisEditForm from "@/app/components/diagnosis/DiagnosisEditForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function DiagnosisEditPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  await connectMongo();
  const doc = await Diagnosis.findById(id).lean();
  if (!doc || String(doc.userId) !== session.user.id) notFound();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <MemberHeader name={session.user.name} image={session.user.image} />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <DiagnosisEditForm
          initial={{
            id,
            result: {
              strengthType: doc.result?.strengthType ?? "",
              suitableJobs: doc.result?.suitableJobs ?? [],
              nextSteps: doc.result?.nextSteps ?? [],
              summary: doc.result?.summary ?? "",
            },
            careerRoadmap: {
              shortTerm: doc.careerRoadmap?.shortTerm ?? "",
              midTerm: doc.careerRoadmap?.midTerm ?? "",
              longTerm: doc.careerRoadmap?.longTerm ?? "",
            },
          }}
        />
      </Container>
    </Box>
  );
}
