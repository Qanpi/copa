import express from "express"
import matches from "../controllers/matchController.js"
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