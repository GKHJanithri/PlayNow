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
router.get("/:id/returnBookedItem", itemControllers.returnBookedItem);
router.get("/:id/bookedItem", itemControllers.getBookedItem);

//export the router
module.exports = router;

