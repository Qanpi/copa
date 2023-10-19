import { query, param, body } from "express-validator";
import * as stages from "../controllers/stagesController.js";
import * as rounds from "../controllers/roundsController.js";
import * as groups from "../controllers/groupsController.js";
import * as matches from "../controllers/matchesController.js";
import * as divisions from "../controllers/divisionsController.js";
import * as participants from "../controllers/participationsController.js";
import express from "express";
import { isAuthMiddleware, isAuthorizedMiddleware } from "../middleware/auth.js";
import { validateObjectIdInBody, reportValidationErrors } from "../middleware/validation.js";

const router = express.Router({ mergeParams: true });

//PARTICIPANTS
//FIXME: id overwrites touranment id
router.get("/participants", participants.getMany);
router.get("/participants/:id", participants.getOne)
router.post("/participants", isAuthMiddleware, validateObjectIdInBody("team"), validateObjectIdInBody("division"), reportValidationErrors, participants.createOne);
router.delete("/participants/:id", isAuthMiddleware, participants.deleteOne);
router.patch("/participants/:id", isAuthMiddleware, participants.updateOne);

//DIVISIONS //TODO: legacy, deprecated, since subdocs (?)
router.get("/divisions", divisions.readMany);
router.post("/divisions", divisions.createOne);
router.put("/divisions/:divisionId", divisions.updateOne);

//STAGES
router.post("/stages/", isAuthorizedMiddleware, stages.createStage);
router.patch(
    "/stages/:stageId",
    isAuthorizedMiddleware,
    stages.updateStage
);
router.delete("/stages/:stageId", isAuthorizedMiddleware, stages.deleteOne);
router.get("/stages", stages.getMany);
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
router.get("/matches/:matchId", matches.getOne)
router.patch("/matches/:matchId", isAuthorizedMiddleware, matches.updateOne);
router.patch("/matches", isAuthorizedMiddleware, matches.resetDates)
router.delete("/matches", isAuthorizedMiddleware, matches.deleteMany);

//GROUPS
router.get("/groups", groups.getMany);

//ROUNDS
router.get("/rounds", rounds.getMany);


export default router;