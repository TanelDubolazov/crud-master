const express = require("express");
const amqp = require("amqplib");

const router = express.Router();

// RabbitMQ setup
const QUEUE_NAME = "billing_queue";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

router.post("/", async (req, res) => {
    try {
        // Connect to RabbitMQ
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // Assert queue
        await channel.assertQueue(QUEUE_NAME);

        // Send message to queue
        const message = JSON.stringify(req.body);
        channel.sendToQueue(QUEUE_NAME, Buffer.from(message));

        console.log("Message sent:", message);

        // Close the connection
        setTimeout(() => {
            connection.close();
        }, 500);

        res.status(200).send({ message: "Message sent to Billing Queue" });
    } catch (error) {
        console.error("Error in Billing API:", error);
        res.status(500).send("Failed to send message to Billing API");
    }
});

module.exports = router;
