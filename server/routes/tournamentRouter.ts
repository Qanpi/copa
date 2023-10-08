import { query, param } from "express-validator";
import * as stages from "../controllers/stagesController.js";
import * as tournaments from "../controllers/tournamentsController.js";
import * as divisions from "../controllers/divisionsController.js";
import { router } from "./api";

// TOURNAMENT
router.get("/tournaments", tournaments.getMultiple);
router.get("/tournaments/current", tournaments.getCurrent);
router.get(
    "/tournaments/:id",
    tournaments.getOne
);
router.post(
    "/tournaments",
    tournaments.createOne
);
router.patch("/tournaments/:id", tournaments.updateOne);
router.delete("/tournaments/:id", tournaments.deleteOne);

//DIVISIONS
router.get("/tournaments/:id/divisions/", divisions.getMultiple)

//STAGES
router.post("/tournaments/:id/stages/", stages.createStage);
router.patch(
    "/tournaments/:tournamentId/stages/:stageId",
    stages.updateStage
);
router.get("/tournaments/:id/stages/current", stages.getCurrentStage);
router.get(
    "/tournaments/:tournamentId/stages/:stageId",
    [param("stageId")],
    stages.getStageData
);
router.get("/tournaments/:tournamentId/stages/:stageId/seeding", stages.getSeeding);
router.get("/tournaments/:tournamentId/stages/:stageId/standings", stages.getStandings);

export default router;