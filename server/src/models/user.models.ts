// models/user.models.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    grade: { type: String, required: true },
    name: { type: String, required: true },
    barcode: {
      type: String,
      unique: true,
      sparse: true, // allow multiple docs with null/undefined barcode
      index: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      required: function (this: any) {
        return this.role !== "user";
      },
    },
    password: {
      type: String,
      required: function (this: any) {
        return this.role !== "user";
      },
    },
    role: {
      type: String,
      enum: ["admin", "user", "manager"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
