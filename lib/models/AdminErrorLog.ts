import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const AdminErrorLogSchema = new Schema(
  {
    occurredAt: { type: Date, required: true, index: true, default: Date.now },
    type: { type: String, required: true, index: true },
    message: { type: String, required: true },
    impact: { type: String, default: "unknown" },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
      index: true,
    },
    source: { type: String, default: "app" },
  },
  { timestamps: true },
);

export type AdminErrorLogDocument = InferSchemaType<typeof AdminErrorLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AdminErrorLog =
  models.AdminErrorLog || model("AdminErrorLog", AdminErrorLogSchema);
