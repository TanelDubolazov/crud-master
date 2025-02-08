const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const express = require("express");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const { configureProxy } = require("./proxy"); 

require("dotenv").config();

let openApiDocument = {};
try {
  const openApiFile = fs.readFileSync(path.join(__dirname, "openapi.yaml"), "utf8");
  openApiDocument = yaml.load(openApiFile);
} catch (err) {
  console.error("⚠️ Could not load openapi.yaml:", err.message);
}

const app = express();

if (Object.keys(openApiDocument).length > 0) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
}

app.use(morgan("dev"));

configureProxy(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const billingRoutes = require("./routes");
app.use("/api/billing", billingRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
  if (Object.keys(openApiDocument).length > 0) {
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
  } else {
    console.log("No OpenAPI spec loaded – Swagger docs not available.");
  }
});
