const express = require("express");
const router = express.Router();
const controller = require("../Cotrollers/EventControler");

router.post("/", controller.createEvent);
router.get("/", controller.getEvents);
router.get("/:id", controller.getEventById);
router.put("/:id", controller.updateEvent);
router.delete("/:id", controller.deleteEvent);

// join / leave
router.post("/:id/join", controller.joinEvent);
router.post("/:id/leave", controller.leaveEvent);

module.exports = router;
