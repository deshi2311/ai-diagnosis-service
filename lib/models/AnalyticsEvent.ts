import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const AnalyticsEventSchema = new Schema(
  {
    event: { type: String, required: true, index: true },
    anonymousSessionId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, default: null, index: true },
    diagnosisId: { type: Schema.Types.ObjectId, default: null, index: true },
    dedupeKey: { type: String, required: true, unique: true },
    testRunId: { type: String, default: null, index: true },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AnalyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export type AnalyticsEventDocument = InferSchemaType<typeof AnalyticsEventSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AnalyticsEvent =
  models.AnalyticsEvent || model("AnalyticsEvent", AnalyticsEventSchema);
