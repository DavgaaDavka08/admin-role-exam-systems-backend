// models/user.models.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    grade: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user", "manager"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("test", UserSchema); // 🔥 "test" биш "User"

export default User;
