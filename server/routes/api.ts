import express, { Request, Response } from "express";

import mongoose from "mongoose";
import * as divisions from "../controllers/divisionsController.js";
import * as teams from "../controllers/teamsController.js";
import * as tournaments from "../controllers/tournamentsController.js";
import * as users from "../controllers/usersController.js";
import tournamentRouter from "./tournament.js";
import { isAuthenticated, isAuthorized } from "../middleware/auth.js";
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
  isAuthorized,
  body("divisions").isArray({ min: 1, max: 10 }),
  reportValidationErrors,
  tournaments.createOne
);
router.patch("/tournaments/:id",
  isAuthorized,
  tournaments.updateOne);
router.delete("/tournaments/:id", isAuthorized,
  tournaments.deleteOne);

router.use("/tournaments/:id", tournamentRouter);

//TEAMS
router.get("/teams", teams.getMultiple);
router.post("/teams", isAuthenticated, teams.createOne);
router.patch("/teams/:id", isAuthenticated, teams.updateOne);
router.get("/teams/:id", teams.getById);
router.get("/teams/:id/users", teams.getUsersInTeam);
router.delete("/teams/:teamId/users/:userId", isAuthenticated, teams.removeUserFromTeam);
router.delete("/teams/:id", isAuthenticated, teams.removeById);
router.get("/teams/:id/invite", isAuthenticated, teams.generateInviteToken);
router.post("/teams/:id/users", isAuthenticated, teams.joinTeam);

//USERS
router.get("/users", isAuthorized, users.getMultiple);
router.get("/users/:id", isAuthenticated, users.getOneById);
router.patch("/users/:id", isAuthenticated, users.updateOne);
router.post("/users", isAuthorized, users.createOne);
router.delete("/users/:id", isAuthenticated, users.deleteOne);

//FIXME: DEVELOPMEN ONLY
router.delete("/", async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === "development") {
    await mongoose.connection.dropDatabase();
    return res.status(204).send({});
  }

  res.send({})
})

export default router;
