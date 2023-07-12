import express from "express";
import { query, body } from "express-validator";

import * as teams from "../controllers/teams.js";
import * as matches from "../controllers/matches.js";
import * as tournaments from "../controllers/tournaments.js";
import * as users from "../controllers/users.js"

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

router.get("/teams/:id", teams.getOne);

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

router.get("/users", users.getMultiple)

export default router;
