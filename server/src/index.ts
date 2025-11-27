import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/connect.db";

import userRoute from "./routers/user.router";
dotenv.config();

const app = express();

app.use(express.json());

connectDb();

const port = process.env.PORT || 5000;
app.use("/api/auth", userRoute);

app.get("/", (req, res) => {
  res.send("started back-end hello world");
});

app.listen(port as number, "localhost", () => {
  console.log(`Server is running at http://localhost:${port}`);
});
