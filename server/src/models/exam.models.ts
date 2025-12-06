// models/exam.models.ts
import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  id: String, // "A" | "B" | "C" | "D"
  text: String,
});

const questionSchema = new mongoose.Schema({
  id: String, // uuid/string
  question: String,
  options: [optionSchema],
  correctAnswer: String, // "A" | "B" | "C" | "D"
});

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    duration: Number, // минут
    questions: [questionSchema],
  },
  { timestamps: true }
);

export const Exam = mongoose.model("Exam", examSchema);
