const express = require("express");
const router = express.Router();

//insert the controller
const itemControllers = require("../controllers/itemControllers");

router.get("/", itemControllers.getItems);
router.post("/", itemControllers.createItem);
router.put("/:id", itemControllers.updateItem);
router.delete("/:id", itemControllers.deleteItem);
router.post("/:id/reserveItem", itemControllers.reserveItem);
router.post("/:id/returnItem", itemControllers.returnItem); 
router.delete("/:id/cancelreservedItem", itemControllers.cancelreservedItem);

// Get all item reservations for a student
router.get("/itemReservations", itemControllers.getStudentReservations);
router.get("/:id/returnBookedItem", itemControllers.returnBookedItem);
router.get("/:id/bookedItem", itemControllers.getBookedItem);

// Get all item reservations for admin
router.get("/allReservations", itemControllers.getAllReservations);
router.patch("/allReservations/:id", itemControllers.updateReservationStatus);

//export the router
module.exports = router;

