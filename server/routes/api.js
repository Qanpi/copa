import express from "express";
import { queryDatabase } from "../db.js"
import { query, validationResult } from "express-validator";
const router = express.Router();

router.get(
  "/games",

  [query("startDate").isDate(), query("endDate").isDate()],

  async (req, res)  => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      const {startDate, endDate } = req.query;

      const start = Date.parse(startDate);
      const end = Date.parse(endDate);

      if (start >= end) 
        throw new Error("The specified end date predates the start date.")

      const querySpec = {
        query: "SELECT * FROM MATCHES m"
      }

      const resources = await queryDatabase("matches", querySpec); //will throw error automatically due to express

      return res.send({resources});
    }

    res.send({ errors: result.array() });
  }
);

export default router;
