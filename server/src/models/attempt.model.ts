// models/attempt.model.ts
import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: String, // question.id
  selectedOption: String, // "A" | "B" | "C" | "D"
});

const attemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    finishedAt: { type: Date },
    isSubmitted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Attempt = mongoose.model("Attempt", attemptSchema);
