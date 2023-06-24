import { validationResult } from "express-validator";
import config from "./config.js";
import DatabaseModel from "./model.js";
import { CosmosClient } from "@azure/cosmos";
import https from "https";

const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
  agent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

const dbModel = new DatabaseModel(
  cosmosClient,
  config.database.id,
  config.containers
);

const controller = {};

controller.getMatches = async (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) return res.send({ errors: result.array() });

  const { startDate, endDate } = req.query;
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);

  if (end < start)
    return next(new Error("The specified end date predates the start date."));

  const querySpec = {
    query: "SELECT * FROM MATCHES m",
  };

  const resources = await dbModel.query("matches", querySpec);
  res.send({ resources });
};

export default controller;
