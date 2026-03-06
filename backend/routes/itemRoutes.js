const express = require("express");
const router = express.Router();
//Insert the model
const Item = require("../models/itemModel");

//insert the controller
const itemControllers = require("../controllers/itemControllers");

router.get("/", itemControllers.getAllItems);
router.post("/", itemControllers.createItem);
router.put("/:id", itemControllers.updateItem);
router.delete("/:id", itemControllers.deleteItem);




//export the router
module.exports = router;

