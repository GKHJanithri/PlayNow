const express = require("express");
const cors = require("cors");
const itemRoutes = require("./routes/itemRoutes");
const reservationRoutes = require("./routes/itemReservationRoutes");

const authRoutes = require("./routes/AuthRoute");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/reservations", reservationRoutes);

// Routes
const eventRoutes = require("./routes/EventRoute");
const matchRoutes = require("./routes/MatchRoute");
const practiceRoutes = require("./routes/PracticeRoute");

app.use("/api/events", eventRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/practices", practiceRoutes);
app.use("/api/auth", authRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("PlayNow API is running...");
});

module.exports = app;