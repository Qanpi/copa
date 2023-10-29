import express from "express";

import { rateLimit } from "express-rate-limit";
import { body, param } from "express-validator";
import * as teams from "../controllers/teamsController.js";
import * as tournaments from "../controllers/tournamentsController.js";
import * as users from "../controllers/usersController.js";
import { isAuthMiddleware, isAuthorizedMiddleware } from "../middleware/auth.js";
import { reportValidationErrors } from "../middleware/validation.js";
import { TournamentStatesValues } from "../models/tournament.js";
import tournamentRouter from "./tournament.js";

const router = express.Router();

//RATE LIMITING
if (process.env.NODE_ENV !== "development") {

  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, //10min, taken from the npm page
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })

  router.use(apiLimiter);
}

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
  isAuthorizedMiddleware,
  body("divisions").isArray({ min: 1, max: 10 }),
  reportValidationErrors,
  tournaments.createOne
);
router.patch("/tournaments/:id",
  isAuthorizedMiddleware,
  body("state").optional().isString().isIn(TournamentStatesValues),
  reportValidationErrors,
  tournaments.updateOne);
router.delete("/tournaments/:id", isAuthorizedMiddleware,
  tournaments.deleteOne);

router.use("/tournaments/:id", tournamentRouter);

//TEAMS
router.get("/teams", teams.getMultiple);
router.get("/teams/:id/participations", param("id").isMongoId(), reportValidationErrors, teams.getParticipations);
router.post("/teams", isAuthMiddleware, body("manager").isMongoId(), body("name").trim().isString().notEmpty(), reportValidationErrors, teams.createOne);
router.patch("/teams/:id", isAuthMiddleware, teams.updateOne);
router.get("/teams/:id", teams.getById);
router.get("/teams/:teamId/users", teams.getUsersInTeam);
router.post("/teams/:teamId/users", isAuthorizedMiddleware, teams.addUserToTeam);
router.delete("/teams/:teamId/users/:userId", isAuthMiddleware, param("userId").isMongoId(), reportValidationErrors, teams.removeUserFromTeam);
router.delete("/teams/:id", isAuthMiddleware, teams.removeById);
router.get("/teams/:id/invite", isAuthMiddleware, teams.generateInviteToken);
router.post("/teams/:id/join", isAuthMiddleware, body("token").isBase64({ urlSafe: true }).notEmpty(), param("id").isMongoId(), reportValidationErrors, teams.joinViaInviteToken);

//USERS
router.get("/users", isAuthorizedMiddleware, users.getMultiple);
router.get("/users/:id", users.getOneById);
router.patch("/users/:id",  isAuthMiddleware, body("name").trim().isString().notEmpty(), body("nickname").trim().isString(), reportValidationErrors, users.updateOne);
router.post("/users", isAuthorizedMiddleware, users.createOne);
router.delete("/users/:id", isAuthMiddleware, users.deleteOne);

export default router;
