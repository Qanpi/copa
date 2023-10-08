import { query, param } from "express-validator";
import * as stages from "../controllers/stagesController.js";
import * as divisions from "../controllers/divisionsController.js";
import * as participants from "../controllers/participationsController.js";
import express from "express";

const router = express.Router();

//DIVISIONS

//PARTICIPANTS
router.post("/participants", participants.createOne);

//STAGES
router.post("/stages/", stages.createStage);
router.patch(
    "/stages/:stageId",
    stages.updateStage
);
router.get("/stages/current", stages.getCurrentStage);
router.get(
    "/stages/:stageId",
    [param("stageId")],
    stages.getStageData
);
router.get("/stages/:stageId/seeding", stages.getSeeding);
router.get("/stages/:stageId/standings", stages.getStandings);

export default router;