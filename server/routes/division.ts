import { query, param } from "express-validator";
import * as stages from "../controllers/stagesController.js";
import * as matches from "../controllers/matchesController.js";
import * as divisions from "../controllers/divisionsController.js";
import * as participants from "../controllers/participationsController.js";
import express from "express";

const router = express.Router({ mergeParams: true });

//DIVISIONS

//PARTICIPANTS
router.get("/participants", participants.getMany);
router.get("/participants/:id", participants.getOne)
router.post("/participants", participants.createOne);
router.delete("/participants/:id", participants.deleteOne);
router.patch("/participants/:id", participants.updateOne);

//STAGES
router.post("/stages/", stages.createStage);
router.patch(
    "/stages/:stageId",
    stages.updateStage
);
router.get("/stages/current", stages.getCurrentStage);
router.get(
    "/stages/:stageId",
    stages.getStageData
);
router.get("/stages/:stageId/seeding", stages.getSeeding);
router.get("/stages/:stageId/standings", stages.getStandings);

//MATCHES 
router.get(
    "/matches",
    matches.getMany
);
router.get("/matches/:id", matches.getOne)
router.patch("/matches/:id", matches.updateOne);
router.patch("/matches", matches.resetDates)
router.delete("/matches", matches.deleteMany);

export default router;