const express = require("express");
const router = express.Router();
const ctrl = require("../Cotrollers/PracticeController");

router.post("/", ctrl.createPractice);
router.get("/", ctrl.getPractices);
router.get("/:id", ctrl.getPracticeById);
router.put("/:id", ctrl.updatePractice);
router.delete("/:id", ctrl.deletePractice);

module.exports = router;
