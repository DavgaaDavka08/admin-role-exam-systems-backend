import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
    originalName: String,
    size: Number,
    mime: String,
  },
  { _id: false }
);

const taskSubmissionSchema = new mongoose.Schema(
  {
    taskId: String,
    archive: fileSchema, // ZIP / project archive
    screenshots: [fileSchema], // student-uploaded screenshots
    notes: String,
  },
  { _id: false }
);

const scoreBreakdownSchema = new mongoose.Schema(
  {
    uiSimilarity: { type: Number, default: 0 },
    responsive: { type: Number, default: 0 },
    codeStructure: { type: Number, default: 0 },
    functionality: { type: Number, default: 0 },
  },
  { _id: false }
);

const taskReviewSchema = new mongoose.Schema(
  {
    taskId: String,
    scores: { type: scoreBreakdownSchema, default: () => ({}) },
    feedback: String,
    totalScore: { type: Number, default: 0 }, // 0..maxScore (per task)
  },
  { _id: false }
);

const practicalSubmissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },
    tasks: [taskSubmissionSchema],
    isSubmitted: { type: Boolean, default: false },
    submittedAt: Date,

    // admin review
    status: {
      type: String,
      enum: ["pending", "reviewed", "passed", "failed"],
      default: "pending",
      index: true,
    },
    reviews: [taskReviewSchema],
    totalScore: { type: Number, default: 0 }, // sum across tasks
    maxScore: { type: Number, default: 0 },
    overallFeedback: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
  },
  { timestamps: true }
);

practicalSubmissionSchema.index(
  { studentId: 1, examId: 1 },
  { unique: true }
);

export const PracticalSubmission = mongoose.model(
  "PracticalSubmission",
  practicalSubmissionSchema
);
