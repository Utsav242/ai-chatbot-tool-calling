import express from "express";
import cors from "cors";
import { generate } from "./chatbot.js";

const app = express();
const port = 3001;
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("WELCOME TO CHATGPT!");
});

app.post("/chat", async (req, res) => {
  const { message, threadId } = req.body;

  //   todo validate above fields

  if (!message || !threadId) {
    return res
      .status(400)
      .json({ error: "Missing required fields: message and threadId" });
  }

  console.log("message", message);
  const result = await generate(message, threadId);
  res.json({ message: result });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
