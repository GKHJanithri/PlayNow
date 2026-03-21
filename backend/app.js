const express = require("express");
const cors = require("cors");
const itemRoutes = require("./routes/itemRoutes");
const reservationRoutes = require("./routes/itemReservationRoutes");
const returnRoutes = require("./routes/itemReturnRoutes");
const authRoutes = require("./routes/authRoutes");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/reservations", reservationRoutes);
app.use("/returns", returnRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("PlayNow API is running...");
});

module.exports = app;