import express from "express"
import matches from "../controllers/matches.js"
import { query } from "express-validator";

const router = express.Router()

router.get("/matches",

  [
    query("startDate").isDate(),
    query("endDate").isDate()
  ],

  matches.getMultiple
);

export default router;