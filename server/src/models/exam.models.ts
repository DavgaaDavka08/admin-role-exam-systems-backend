// models/exam.models.ts
import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    id: String,
    text: String,
    image: String,
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    id: String,
    question: String,
    image: String,
    type: {
      type: String,
      enum: ["single", "multiple"],
      default: "single",
    },
    options: [optionSchema],
    // legacy single-answer field, still populated for "single" questions
    correctAnswer: String,
    // canonical multi-answer field; length === 1 when type is "single"
    correctAnswers: [String],
  },
  { _id: false }
);

const practicalTaskSchema = new mongoose.Schema(
  {
    id: String,
    title: { type: String, required: true },
    instructions: String,
    exampleImage: String,
    referenceImage: String,
    maxScore: { type: Number, default: 100 },
  },
  { _id: false }
);

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    duration: Number,

    hasTheory: { type: Boolean, default: true },
    hasPractical: { type: Boolean, default: false },

    theoryMaxScore: { type: Number, default: 100 },
    practicalMaxScore: { type: Number, default: 100 },

    // Part 1
    questions: [questionSchema],

    // Part 2
    practicalTasks: [practicalTaskSchema],
  },
  { timestamps: true }
);

export const Exam = mongoose.model("Exam", examSchema);
