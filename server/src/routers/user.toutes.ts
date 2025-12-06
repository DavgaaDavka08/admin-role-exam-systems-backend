import express from "express";
import User from "../models/user.models";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // password нуух
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

export default router;
