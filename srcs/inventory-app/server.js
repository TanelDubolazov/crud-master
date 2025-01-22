require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./app/config/database");
const movieRoutes = require("./app/routes/movieRoutes");

const app = express();
app.use(bodyParser.json());

// Routes
app.use("/api/movies", movieRoutes);

// Sync Database and Start Server
sequelize.sync().then(() => {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Inventory API running on port ${PORT}`);
    });
}).catch((err) => {
    console.error("Failed to sync database:", err.message);
});
