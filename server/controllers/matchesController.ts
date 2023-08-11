import { validationResult } from "express-validator";
import Match from "../models/match.js";
import { Request, Response } from "express";

export const getMany = async (req: Request, res: Response) => {
  const endFilter = req.query.end
    ? {
        date: {
          $lt: req.query.end,
        },
      }
    : {};

  const startFilter = req.query.start
    ? {
        date: {
          $gte: req.query.start,
        },
      }
    : {};

  const matches = await Match.find({
    $and: [startFilter, endFilter]
  });
  res.send(matches);
};

export const deleteMany = async (req: Request, res: Response) => {
  await Match.deleteMany({});
  res.status(204).send({});
};

export const updateOne = async (req: Request, res: Response) => {
  const match = await Match.findByIdAndUpdate(req.params.matchId, req.body, {
    new: true,
  });
  res.send(match);
};
