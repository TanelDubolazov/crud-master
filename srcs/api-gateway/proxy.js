const { createProxyMiddleware } = require("http-proxy-middleware");

// Proxy all /api/movies requests to the Inventory API
const inventoryProxy = createProxyMiddleware({
    target: process.env.INVENTORY_API_URL || "http://localhost:8080",
    changeOrigin: true,
});

module.exports = inventoryProxy;
