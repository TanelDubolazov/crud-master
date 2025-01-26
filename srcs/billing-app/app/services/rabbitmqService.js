const amqp = require("amqplib");
const Order = require("../models/order");
require("dotenv").config();

const QUEUE_NAME = process.env.QUEUE_NAME || "billing_queue";

async function consumeMessages() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME);
    console.log(`Waiting for messages in queue: ${QUEUE_NAME}`);

    channel.consume(QUEUE_NAME, async (message) => {
      if (message !== null) {
        const orderData = JSON.parse(message.content.toString());
        console.log("Received message:", orderData);

        // Save to DB
        try {
          await Order.create(orderData);
          console.log("Order saved:", orderData);
        } catch (error) {
          console.error("Failed to save order:", error);
        }

        // Acknowledge message
        channel.ack(message);
      }
    });
  } catch (error) {
    console.error("Failed to consume messages:", error);
  }
}

module.exports = { consumeMessages };
