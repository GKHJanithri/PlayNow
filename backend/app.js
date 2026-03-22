const express = require("express");
const cors = require("cors");
const facilityRoutes = require("./routes/facilityRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("PlayNow API is running...");
});

// Mount facility routes
app.use("/api", facilityRoutes);

module.exports = app;