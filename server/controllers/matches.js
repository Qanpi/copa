import { validationResult } from "express-validator";

const matches = {}

matches.getMultiple = async (req, res, next) => {
  const result = validationResult(req);
  console.log(req.session)

  if (!result.isEmpty()) return res.send({ errors: result.array() });

  const { startDate, endDate } = req.query;
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);

  if (end < start)
    return next(new Error("The specified end date predates the start date."));

  const querySpec = {
    query: "SELECT * FROM MATCHES m",
  };

  const resources = await sqlDatabase.query("matches", querySpec);
  res.send({ resources });
};

export default matches;
