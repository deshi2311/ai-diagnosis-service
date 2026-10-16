import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const DiagnosisSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    answers: {
      q1: { type: String, required: true },
      q2: { type: String, required: true },
      q3: { type: String, required: true },
      q4: { type: String, required: true },
      q5: { type: String, required: true },
    },
    result: {
      strengthType: { type: String, default: "" },
      suitableJobs: { type: [String], default: [] },
      nextSteps: { type: [String], default: [] },
      summary: { type: String, default: "" },
      usage: {
        inputTokens: { type: Number, default: 0 },
        outputTokens: { type: Number, default: 0 },
        cacheReadTokens: { type: Number, default: 0 },
        cacheCreationTokens: { type: Number, default: 0 },
      },
      estimatedCostUsd: { type: Number, default: 0 },
    },
    careerRoadmap: {
      shortTerm: { type: String, default: "" },
      midTerm: { type: String, default: "" },
      longTerm: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

export type DiagnosisDocument = InferSchemaType<typeof DiagnosisSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Diagnosis =
  models.Diagnosis || model("Diagnosis", DiagnosisSchema);
