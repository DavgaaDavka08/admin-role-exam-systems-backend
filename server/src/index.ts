import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/connect.db";
import cors from "cors";
import userRoute from "./routers/user.router";
import roleRouter from "./routers/role.router";
dotenv.config();

connectDb();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use("/api/auth", userRoute);
app.use("/api/users", roleRouter);

const port = process.env.PORT || 4000;
console.log("BACKEND STARTED");
app.get("/", (req, res) => {
  console.log("REQUEST RECEIVED");
  res.send("OK WORKING");
});
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
