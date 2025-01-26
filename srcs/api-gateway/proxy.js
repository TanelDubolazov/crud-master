const { createProxyMiddleware } = require("http-proxy-middleware");

const inventoryProxy = createProxyMiddleware({
  target: process.env.INVENTORY_API_URL || "http://localhost:8080",
  changeOrigin: true,
});

module.exports = inventoryProxy;
