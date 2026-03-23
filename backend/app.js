const express = require("express");
const cors = require("cors");
const facilityRoutes = require("./routes/facilityRoutes");
const mongoose = require("mongoose");
const itemRoutes = require("./routes/itemRoutes");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/items", itemRoutes);


// Routes
const eventRoutes = require("./Routes/EventRoute");
const matchRoutes = require("./Routes/MatchRoute");
const practiceRoutes = require("./Routes/PracticeRoute");
const authRoutes = require("./Routes/AuthRoute");

app.use("/api/events", eventRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/practices", practiceRoutes);
app.use("/api/auth", authRoutes);
// Mount facility routes
app.use("/api", facilityRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("PlayNow API is running...");
});

module.exports = app;