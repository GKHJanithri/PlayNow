const express = require("express");
const router = express.Router();


//Insert the model

const ItemReturn = require("../models/itemReturnModel");

//insert the controller

const returnControllers = require("../controllers/itemReturnControllers");


router.get("/", returnControllers.getAllItemReturns);
router.post("/", returnControllers.createItemReturn);
router.put("/:id", returnControllers.updateItemReturn);
router.delete("/:id", returnControllers.deleteItemReturn);

 


//export the router
module.exports = router;

