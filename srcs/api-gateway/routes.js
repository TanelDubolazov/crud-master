const express = require("express");
const amqp = require("amqplib");

const router = express.Router();

const QUEUE_NAME = process.env.QUEUE_NAME || "billing_queue";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

router.post("/", async (req, res) => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME);

    const message = JSON.stringify(req.body);
    channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
    console.log("Message sent:", message);

    setTimeout(() => {
      connection.close();
    }, 500);

    res.status(200).json({ message: "Message sent to Billing Queue" });
  } catch (error) {
    console.error("Error sending message to Billing API:", error);
    res.status(500).send("Failed to send message to Billing API");
  }
});

module.exports = router;
