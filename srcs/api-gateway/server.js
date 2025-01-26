require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const proxyRoutes = require("./proxy");
const billingRoutes = require("./routes");

const app = express();
app.use(bodyParser.json());

// Proxy routes for Inventory API
app.use("/api/movies", proxyRoutes);

// RabbitMQ routes for Billing API
app.use("/api/billing", billingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);require("dotenv").config();
    const express = require("express");
    const bodyParser = require("body-parser");
    const proxyRoutes = require("./proxy");       // <-- For /api/movies
    const billingRoutes = require("./routes");    // <-- For /api/billing
    
    const app = express();
    app.use(bodyParser.json());
    
    // Proxy routes for Inventory API
    app.use("/api/movies", proxyRoutes);
    
    // RabbitMQ routes for Billing API
    app.use("/api/billing", billingRoutes);
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send("Something went wrong!");
    });
    
    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`API Gateway is running on port ${PORT}`);
    });
    
    res.status(500).send("Something went wrong!");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
