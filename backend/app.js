const express = require("express");
const cors = require("cors");
const itemRoutes = require("./routes/itemRoutes");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/items", itemRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("PlayNow API is running...");
});

module.exports = app;