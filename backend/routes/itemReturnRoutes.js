const express = require("express");
const router = express.Router();


//Insert the model

const ItemReturn = require("../models/itemReturnModel");

//insert the controller

const returnControllers = require("../controllers/itemReturnControllers");


router.get("/", returnControllers.getAllItemReturns);

 


//export the router
module.exports = router;

