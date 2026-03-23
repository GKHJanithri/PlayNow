const express = require("express");
const router = express.Router();
const controller = require("../controllers/facilityController");

router.get("/facilities", controller.getFacilities);
router.post("/facilities", controller.addFacility);
router.post("/book", controller.bookFacility);
router.get("/bookings", controller.getBookings);
router.delete("/booking/:id", controller.cancelBooking);
router.put("/booking/:id", controller.updateBooking);

module.exports = router;