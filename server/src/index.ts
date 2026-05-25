import express from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDb } from "./config/connect.db";
import cors from "cors";

import userRoute from "./routers/user.router";
import roleRouter from "./routers/role.router";
import examRouter from "./routers/exam.router";
import attemptRouter from "./routers/attempt.router";
import usersRouter from "./routers/user.toutes";
import studentRouter from "./routers/student.router";
import adminRouter from "./routers/admin.router";
import practicalRouter from "./routers/practical.router";

dotenv.config();
connectDb();

const app = express();
app.use(express.json({ limit: "10mb" }));

// serve locally stored uploads (fallback when Cloudinary is not configured)
app.use(
  "/uploads",
  (_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.resolve(process.cwd(), "uploads"))
);

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



app.use("/api/auth", userRoute);
app.use("/api/users", usersRouter);
app.use("/api/roles", roleRouter);
app.use("/api/exams", examRouter);
app.use("/api/attempts", attemptRouter);
app.use("/api/students", studentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/practical", practicalRouter);

// simple health endpoints (useful for deploy verification)
app.get("/api", (_req, res) => {
  res.json({ ok: true, service: "admin-role-exam-systems-backend" });
});
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 4000;

console.log("BACKEND STARTED");

app.get("/", (req, res) => {
  console.log("REQUEST RECEIVED");
  res.send("OK WORKING");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
