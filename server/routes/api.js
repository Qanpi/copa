import express from "express"
import { query } from "express-validator";

import * as teams from "../controllers/teams.js";
import * as matches from "../controllers/matches.js"

const router = express.Router()

router.get("/matches",

  [
    query("startDate").isDate(),
    query("endDate").isDate().optional()
  ],

  matches.getMultiple
);

router.get("/teams", teams.getMultiple)

router.post("/teams", teams.createOne)

export default router;