require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./app/config/database.js");
const { healthCheck } = require("./app/controllers/healthcheck");
const { consumeMessages } = require("./amqpConsumer");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", healthCheck);

db.sync()
  .then(() => {
    console.log("Database synced successfully.");

    consumeMessages();

    const port = process.env.PORT || 8081;
    app.listen(port, () => {
      console.log(`Billing API listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to sync database:", err);
  });
