import express, { Request, Response } from "express";
import { query, body } from "express-validator";

import * as teams from "../controllers/teamsController.js";
import * as matches from "../controllers/matchesController.js";
import * as users from "../controllers/usersController.js";
import * as participants from "../controllers/participationsController.js";
import tournamentRouter from "./tournamentRouter.js"
import mongoose from "mongoose";

export const router = express.Router();

router.use("/tournament", tournamentRouter);

router.get(
  "/matches",
  [query("start").isDate(), query("end").isDate()],
  matches.getMany
);

router.get("/matches/:id", matches.getOne)

router.patch("/matches/:id", matches.updateOne);

router.patch("/matches", matches.resetDates)

router.delete("/matches", matches.deleteMany);

router.get("/teams", teams.getMultiple);

router.post("/teams", teams.createOne);

router.patch("/teams/:id", teams.updateOne);

router.get("/teams/:id", teams.getById);

router.get("/teams/:id/players", teams.getPlayersInTeam);

router.delete("/teams/:teamId/players/:playerId", teams.removePlayerFromTeam);

router.delete("/teams/:id", teams.removeById);

router.get("/teams/:id/invite", teams.generateInviteToken);

router.post("/teams/:id/join", teams.joinTeam);

// router.get("/tournaments/:id/groups", tourn.getMultiple)

// router.post("/tournaments/:id/groups", groups.createOne);

// router.patch("/tournaments/:tournamentId/groups/:groupId", groups.updateOne)

//FIXME: refactor into subcollection of tounament
router.get(
  "/participants",
  [
    query("team").optional(),
    query("tournament").optional(),
    query("group").isString().optional(),
  ],
  participants.getMultiple
);

router.get("/participants/:id", participants.getOne)

router.post("/participants", participants.createOne);

router.delete("/participants/:id", participants.deleteOne);

router.put("/participants/:id", participants.updateOne);

router.patch("/participants/:id", participants.updateOne);

// router.get("/tournaments/:id/teams", tournaments.getRegisteredTeams);

// router.post("/tournaments/:id/teams", tournaments.registerTeam);

// router.delete("/tournaments/:tournamentId/teams/:teamId", tournaments.unregisterTeam);

// router.get("/teams/:id/tournaments", teams.getTournaments);

router.get("/users", users.getMultiple);

router.get("/users/:id", users.getOneById);

router.patch("/users/:id", users.updateOne);

router.post("/users", users.createOne);

router.delete("/users/:id", users.deleteOne);

router.delete("/", async (req: Request, res: Response) => {
  await mongoose.connection.dropDatabase();
  return res.status(204).send({});
})

export default router;
