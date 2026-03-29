const express = require("express");
const router = express.Router();
const controller = require("../Controllers/EventControler");

router.post("/", controller.createEvent);
router.get("/", controller.getEvents);
router.get("/:id/fixtures", controller.getEventFixtures);
router.post("/:id/fixtures/generate", controller.generateEventFixtures);
router.put("/:id/fixtures", controller.saveEventFixtures);
router.get("/:id", controller.getEventById);
router.put("/:id", controller.updateEvent);
router.delete("/:id", controller.deleteEvent);

// join / leave
router.post("/:id/join", controller.joinEvent);
router.post("/:id/leave", controller.leaveEvent);

module.exports = router;
