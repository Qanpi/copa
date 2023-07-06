import { validationResult } from "express-validator";
import expressAsyncHandler from "express-async-handler";
import { validate } from "../middleware/validation.js";

export const getMultiple = expressAsyncHandler(async (req, res) => {
  validate(req, res);

  const { startDate, endDate } = req.query;
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);

  if (end < start) {
    throw new Error("The specified end date predates the start date.");
  }

  res.send([{ date: "mon" }, { date: "sun" }]);
});
