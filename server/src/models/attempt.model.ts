import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: String,
  selectedOption: String,
});

const attemptSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    finishedAt: Date,
    isSubmitted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Attempt = mongoose.model("Attempt", attemptSchema);
