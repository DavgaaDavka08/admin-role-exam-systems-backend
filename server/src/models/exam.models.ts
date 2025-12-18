// models/exam.models.ts
import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  id: String,
  text: String,
});

const questionSchema = new mongoose.Schema({
  id: String,
  question: String,
  options: [optionSchema],
  correctAnswer: String,
});

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    description: String,
    duration: Number,
    questions: [questionSchema],
  },
  { timestamps: true }
);

export const Exam = mongoose.model("Exam", examSchema);
