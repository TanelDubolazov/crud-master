require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./app/config/database");
const { consumeMessages } = require("./app/services/rabbitmqService");

const app = express();
app.use(bodyParser.json());

// Health check endpoint
app.get("/health", (req, res) => {
    res.send("Billing API is running.");
});

// Sync database and start RabbitMQ consumer
sequelize.sync().then(() => {
    const PORT = process.env.PORT || 8081;
    app.listen(PORT, () => {
        console.log(`Billing API is running on port ${PORT}`);
        consumeMessages(); // Start consuming RabbitMQ messages
    });
}).catch((err) => {
    console.error("Failed to sync database:", err.message);
});
