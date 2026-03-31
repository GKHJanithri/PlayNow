const express = require("express");
const router = express.Router();
const controller = require("../controllers/facilityController");

router.get("/facilities", controller.getFacilities);
router.get("/facilities/:id", controller.getFacilityById);
router.post("/facilities", controller.addFacility);
router.put("/facilities/:id", controller.updateFacility);
router.delete("/facilities/:id", controller.deleteFacility);
router.post("/book", controller.bookFacility);
router.get("/bookings", controller.getBookings);
router.delete("/booking/:id", controller.cancelBooking);
router.put("/booking/:id", controller.updateBooking);

module.exports = router;