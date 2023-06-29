import { validationResult } from "express-validator";
import asyncHandler from "express-async-handler";

const matches = {};

matches.getMultiple = asyncHandler(async (req, res, next) => {
  const result = validationResult(req);
  console.log(req.session);

  if (!result.isEmpty()) return res.send({ errors: result.array() });

  console.log(req.params)
  const { startDate, endDate } = req.query;
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);

  if (end < start)
    return next(new Error("The specified end date predates the start date."));

  const querySpec = {
    query: "SELECT * FROM MATCHES m",
  };

  res.send({ querySpec });
});

export default matches;
