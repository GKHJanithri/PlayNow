const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const itemRoutes = require("./routes/itemRoutes");
const reservationRoutes = require("./routes/itemReservationRoutes");
const returnRoutes = require("./routes/itemReturnRoutes");
const app = express();

// Middleware
app.use("/items", itemRoutes);
app.use("/reservations", reservationRoutes);
app.use("/returns", returnRoutes);
app.use(express.json());
app.use(cors());  

// Health check route
app.get("/", (req, res) => {
  res.send("PlayNow API is running...");
});

module.exports = app;