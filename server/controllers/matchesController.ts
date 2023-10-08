import { validationResult } from "express-validator";
import Match from "../models/match.js";
import { Request, Response } from "express";

import { bracketsManager } from "../services/bracketsManager.js";

export const getMany = async (req: Request, res: Response) => {
  //FIXME: refactor this better
  const query: any = {};

  if (req.query.scheduled === "true") {
    query["start"] = {
      $exists: true,
    };
  } else if (req.query.scheduled === "false") {
    query["start"] = {
      $exists: false,
    };
  } else {
    const endFilter = req.query.end
      ? {
          start: {
            $lt: req.query.end,
          },
        }
      : {};

    const startFilter = req.query.start
      ? {
          start: {
            $gte: req.query.start,
          },
        }
      : {};

    query["$and"] = [startFilter, endFilter];
  }

  const filter = {...req.query, scheduled: undefined, ...query};

  const matches = await Match.find(filter);
  res.send(matches);
};

export const getOne = async (req: Request, res: Response) => {
  const match = await Match.findById(req.params.id);
  res.send(match);
};

export const deleteMany = async (req: Request, res: Response) => {
  await Match.deleteMany({});
  res.status(204).send({});
};

export const updateOne = async (req: Request, res: Response) => {
  //TODO: if statement
  await bracketsManager.update.match({ ...req.body, id: req.params.id });
  const updated = await Match.findById(req.params.id);

  res.send(updated);
};

export const resetDates = async (req: Request, res: Response) => {
  const matches = await Match.updateMany({}, { $unset: { start: "" } });
  res.send(matches);
};

export const reportResults = async (req: Request, res: Response) => {
  const updated = await Match.findById(req.body.id);
  res.send(updated);
};
