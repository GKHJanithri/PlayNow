const express = require("express");
const router = express.Router();
//Insert the model

const ItemReservation = require("../models/itemReservationModel");

//insert the controller

const reservationControllers = require("../controllers/itemReservationControllers");




router.get("/", reservationControllers.getAllItemReservations);


 


//export the router
module.exports = router;

