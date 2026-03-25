const express = require("express");
const router = express.Router();
//Insert the model

const ItemReservation = require("../models/itemReservationModel");

//insert the controller

const reservationControllers = require("../controllers/itemReservationControllers");


router.get("/", reservationControllers.getAllItemReservations);
router.post("/", reservationControllers.createItemReservation);
router.put("/:id", reservationControllers.updateItemReservation);
router.delete("/:id", reservationControllers.deleteItemReservation);
router.put("/:id", reservationControllers.updateItemReservationStatus);


//export the router
module.exports = router;

