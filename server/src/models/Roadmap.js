import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      default: null,
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "complete"],
      default: "upcoming",
    },
    estimatedHours: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    resources: [
      {
        title: String,
        url: String,
        type: { type: String, enum: ["video", "article", "course", "book", "other"] },
      },
    ],
  },
  { timestamps: true }
);

export const Roadmap = mongoose.model("Roadmap", roadmapSchema);
