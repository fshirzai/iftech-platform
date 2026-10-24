import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    company: { type: String, default: "", trim: true, maxlength: 150 },
    projectType: { type: String, required: true, trim: true, maxlength: 100 },
    budget: { type: String, default: "undecided", maxlength: 50 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    status: {
      type: String,
      enum: ["NEW", "REVIEWING", "CONTACTED", "CLOSED"],
      default: "NEW",
      index: true,
    },
  },
  { timestamps: true, versionKey: false },
);

schema.index({ createdAt: -1 });
export const ProjectRequest =
  mongoose.models.ProjectRequest || mongoose.model("ProjectRequest", schema);
