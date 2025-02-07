const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const express = require("express");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const { configureProxy } = require("./proxy"); // Import proxy configuration

// Load .env if present
require("dotenv").config();

// Attempt to load the OpenAPI spec from openapi.yaml
let openApiDocument = {};
try {
  const openApiFile = fs.readFileSync(path.join(__dirname, "openapi.yaml"), "utf8");
  openApiDocument = yaml.load(openApiFile);
} catch (err) {
  console.error("⚠️ Could not load openapi.yaml:", err.message);
}

// Create an Express app
const app = express();

// Serve Swagger docs at /api-docs if available
if (Object.keys(openApiDocument).length > 0) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
}

// Logging middleware
app.use(morgan("dev"));

// Apply proxy middleware
configureProxy(app);

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Billing routes (RabbitMQ)
const billingRoutes = require("./routes");
app.use("/api/billing", billingRoutes);

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
  if (Object.keys(openApiDocument).length > 0) {
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
  } else {
    console.log("No OpenAPI spec loaded – Swagger docs not available.");
  }
});
