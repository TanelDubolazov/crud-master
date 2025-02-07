const { createProxyMiddleware } = require("http-proxy-middleware");

const configureProxy = (app) => {
  const inventoryApiUrl = process.env.INVENTORY_API_URL;
  
  if (!inventoryApiUrl) {
    console.warn(" INVENTORY_API_URL is not set. Proxy will not function.");
    return;
  }

  app.use("/api/movies", createProxyMiddleware({
    target: `${inventoryApiUrl}/api/movies`,
    changeOrigin: true,
  }));

  console.log(` Proxy configured: /api/movies → ${inventoryApiUrl}/api/movies`);
};

module.exports = { configureProxy };
