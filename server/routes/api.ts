import express, { Request, Response } from "express";

import mongoose from "mongoose";
import * as divisions from "../controllers/divisionsController.js";
import * as teams from "../controllers/teamsController.js";
import * as tournaments from "../controllers/tournamentsController.js";
import * as users from "../controllers/usersController.js";
import tournamentRouter from "./tournament.js";

const router = express.Router();

//TOURNAMENT
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

router.use("/tournaments/:id", tournamentRouter); 

//TEAMS
router.get("/teams", teams.getMultiple);
router.post("/teams", teams.createOne);
router.patch("/teams/:id", teams.updateOne);
router.get("/teams/:id", teams.getById);
router.get("/teams/:id/players", teams.getPlayersInTeam);
router.delete("/teams/:teamId/players/:playerId", teams.removePlayerFromTeam);
router.delete("/teams/:id", teams.removeById);
router.get("/teams/:id/invite", teams.generateInviteToken);
router.post("/teams/:id/join", teams.joinTeam);

//USERS
router.get("/users", users.getMultiple);
router.get("/users/:id", users.getOneById);
router.patch("/users/:id", users.updateOne);
router.post("/users", users.createOne);
router.delete("/users/:id", users.deleteOne);

//FIXME: DEVELOPMEN ONLY
router.delete("/", async (req: Request, res: Response) => {
  await mongoose.connection.dropDatabase();
  return res.status(204).send({});
})

export default router;
