import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/connect.db";
import cors from "cors";

import userRoute from "./routers/user.router";
import roleRouter from "./routers/role.router";
import examRouter from "./routers/exam.router";
import attemptRouter from "./routers/attempt.router";
import usersRouter from "./routers/user.toutes";

dotenv.config();
connectDb();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://admin-role-exam-system-front-end.vercel.app",
      "https://tsonjinexam.site",
      "https://www.tsonjinexam.site",
    ],
    credentials: true,
  })
);

// OPTIONAL (Express 5 дээр OK)
app.options("*", cors());

app.use("/api/auth", userRoute);
app.use("/api/users", usersRouter);
app.use("/api/roles", roleRouter);
app.use("/api/exams", examRouter);
app.use("/api/attempts", attemptRouter);

const port = process.env.PORT || 4000;

console.log("BACKEND STARTED");

app.get("/", (req, res) => {
  console.log("REQUEST RECEIVED");
  res.send("OK WORKING");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
