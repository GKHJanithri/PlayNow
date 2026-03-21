const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const eventRoutes = require("./Routes/EventRoute");
const matchRoutes = require("./Routes/MatchRoute");
const practiceRoutes = require("./Routes/PracticeRoute");
const authRoutes = require("./Routes/AuthRoute");

app.use("/api/events", eventRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/practices", practiceRoutes);
app.use("/api/auth", authRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("PlayNow API is running...");
});

module.exports = app;