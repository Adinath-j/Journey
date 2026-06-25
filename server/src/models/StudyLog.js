import mongoose from "mongoose";

const studyLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "General",
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    notes: {
      type: String,
    },
    completedTopic: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const StudyLog = mongoose.model("StudyLog", studyLogSchema);
