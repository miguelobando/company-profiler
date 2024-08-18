import companyValues from "./modules";
import * as dotenv from "dotenv";
import { saveResult } from "./modules/dynamoService";
import sendMessageToReadyQueue from "./modules/sqsService";
const express = require("express");

dotenv.config();

const port = 3002;
const app = express();
app.use(express.json());

app.post("/company-values", async (req, res) => {
  const url = req.body?.url;
  const userId = req.body?.userId;

  if (!url || !userId) {
    res.status(400).send("Missing required parameters");
    return;
  }

  res
    .status(200)
    .send(
      "Already proccesing request for userId: " + userId + " and url: " + url
    );
  const result = await companyValues(url);
  await saveResult(`${userId}-${url}`, result);
  console.log(`Result saved for userId: ${userId} and url: ${url}`);
  await sendMessageToReadyQueue(`${userId} | ${url}`);
  console.log(`Message sent to ready queue for userId: ${userId}`);
});

app.listen(port, () => {
  console.log(`Scrapper service listening at http://localhost:${port}`);
});

export default app;
