import { validationResult } from "express-validator";
import expressAsyncHandler from "express-async-handler";

export const getMultiple = expressAsyncHandler(async (req, res) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.send({ errors: result.array() });
  }

  const { startDate, endDate } = req.query;
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);

  if (end < start) {
    throw new Error("The specified end date predates the start date.");
  }

  res.send([{ date: "mon" }, { date: "sun" }]);
});
