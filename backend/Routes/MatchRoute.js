const express = require("express");
const router = express.Router();
const ctrl = require("../Cotrollers/MatchController");

router.post("/", ctrl.createMatch);
router.get("/", ctrl.getMatches);
router.get("/:id", ctrl.getMatchById);
router.put("/:id", ctrl.updateMatch);
router.delete("/:id", ctrl.deleteMatch);

module.exports = router;
