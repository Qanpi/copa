import express from "express";
import { query, body } from "express-validator";

import * as teams from "../controllers/teamsController.js";
import * as matches from "../controllers/matchesController.js";
import * as tournaments from "../controllers/tournamentsController.js";
import * as users from "../controllers/usersController.js"

const router = express.Router();

router.get(
  "/matches",

  [
    query("startDate").isDate().optional(),
    query("endDate").isDate().optional(),
  ],

  matches.getMultiple
);

router.get("/teams", teams.getMultiple);

router.post("/teams", teams.createOne);

router.patch("/teams/:id", teams.updateOne)

router.get("/teams/:id", teams.getById);

router.get("/teams/:id/players", teams.getPlayersInTeam)

router.delete("/teams/:teamId/players/:playerId", teams.removePlayerFromTeam)

router.delete("/teams/:id", teams.removeById)

router.get("/teams/:id/invite", teams.generateInviteToken)

router.post("/teams/:id/join", teams.joinTeam)

router.post(
  "/tournaments",
  [
    body("regStart").isDate().optional(),
    body("regEnd").isDate().optional(),
  ],
  tournaments.createOne
);

router.get("/tournaments",
tournaments.getMultiple)

router.get("/tournaments/current", tournaments.getCurrent);

router.get("/tournaments/:id", tournaments.getOne)

router.patch("/tournaments/:id", tournaments.updateOne)

router.get("/tournaments/:id/teams", tournaments.getRegisteredTeams);

router.post("/tournaments/:id/teams", tournaments.registerTeam);

router.delete("/tournaments/:tournamentId/teams/:teamId", tournaments.unregisterTeam);

router.get("/teams/:id/tournaments", teams.getTournaments);

router.get("/users", users.getMultiple)

router.patch("/users/:id", users.updateOne)
export default router;
