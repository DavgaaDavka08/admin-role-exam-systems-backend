import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.use(express.json());

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("started back-end hello world");
});

app.listen(port as number,  "localhost", () => {
  console.log(`Server is running at http://localhost:${port}`);
});
