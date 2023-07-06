import express from "express";
import { query, body } from "express-validator";

import * as teams from "../controllers/teams.js";
import * as matches from "../controllers/matches.js";
import * as tournaments from "../controllers/tournaments.js";
import { isGoodName } from "../middleware/validation.js";

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

router.post(
  "/tournaments",
  [
    body("season").isIn(["autumn", "spring"]),
    body("regStart").isDate(),
    body("regEnd").isDate().optional(),
  ],
  tournaments.createOne
);

router.get("/tournaments",
tournaments.getMultiple)

export default router;
