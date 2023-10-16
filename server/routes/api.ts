import express, { Request, Response } from "express";

import mongoose from "mongoose";
import * as divisions from "../controllers/divisionsController.js";
import * as teams from "../controllers/teamsController.js";
import * as tournaments from "../controllers/tournamentsController.js";
import * as users from "../controllers/usersController.js";
import tournamentRouter from "./tournament.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
import { body, checkSchema } from "express-validator";
import { reportValidationErrors } from "../middleware/validation.js";

const router = express.Router();

//TOURNAMENT
router.get("/tournaments", tournaments.getMultiple);
router.get("/tournaments/current", tournaments.getLatest);
router.get("/tournaments/latest", tournaments.getLatest);
router.get(
  "/tournaments/:id",
  tournaments.getOne
);
router.post(
  "/tournaments",
  isAdmin,
  body("divisions").isArray({ min: 1, max: 10 }),
  reportValidationErrors,
  tournaments.createOne
);
router.patch("/tournaments/:id",
  isAdmin,
  tournaments.updateOne);
router.delete("/tournaments/:id", isAdmin,
  tournaments.deleteOne);

router.use("/tournaments/:id", tournamentRouter);

//TEAMS
router.get("/teams", teams.getMultiple);
router.post("/teams", isAuthenticated, teams.createOne);
router.patch("/teams/:id", isAuthenticated, teams.updateOne);
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
router.delete("/", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  await mongoose.connection.dropDatabase();
  return res.status(204).send({});
})

export default router;
