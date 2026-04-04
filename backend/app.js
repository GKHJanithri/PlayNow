const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// --- Route Imports ---
const authRoutes = require("./routes/AuthRoute");
const eventRoutes = require("./routes/EventRoute");
const matchRoutes = require("./routes/MatchRoute");
const practiceRoutes = require("./routes/PracticeRoute");
const facilityRoutes = require("./routes/facilityRoutes");
const itemRoutes = require("./routes/itemRoutes");
const teamRoutes = require('./Routes/TeamRoute');
const freeAgentRoutes = require('./Routes/FreeAgentRoute'); // <-- New Free Agent import!

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(cors());

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/practices", practiceRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/free-agents", freeAgentRoutes); // <-- New Free Agent endpoint!

// Other module routes
app.use("/api/items", itemRoutes);
app.use("/api", facilityRoutes); // Mount facility routes

// --- Health Check Route ---
app.get("/", (req, res) => {
  res.send("PlayNow API is running...");
});

module.exports = app;