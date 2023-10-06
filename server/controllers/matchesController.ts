import { validationResult } from "express-validator";
import Match from "../models/match.js";
import { Request, Response } from "express";

import { manager } from "./tournamentsController.js";

export const getMany = async (req: Request, res: Response) => {
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

  const query: any = {
    $and: [startFilter, endFilter],
  };

  if (req.query.scheduled === "true") {
    query["start"] = {
      $exists: true
    }
  } else if (req.query.scheduled === "false") {
    query["start"] = {
      $exists: false
    }
  }

  const matches = await Match.find({...req.query, ...query});
  res.send(matches);
};

export const getOne = async(req: Request, res: Response) => {
  const match = await Match.findById(req.params.id);
  res.send(match);
}

export const deleteMany = async (req: Request, res: Response) => {
  await Match.deleteMany({});
  res.status(204).send({});
};

export const updateOne = async (req: Request, res: Response) => {
  //TODO: if statement
  await manager.update.match({...req.body, id: req.params.id});

  // const match = await Match.findByIdAndUpdate(req.params.id, req.body, {
  //   new: true,
  // });

  res.send({});
};

export const resetDates = async(req: Request, res: Response) => {
  const matches = await Match.updateMany({}, {$unset: {start: ""}});
  res.send(matches);
}

export const reportResults = async (req: Request, res: Response) => {

  const updated = await Match.findById(req.body.id);
  res.send(updated)
}