import { validationResult } from "express-validator";
import Match from "../models/match.js";
import { Request, Response } from "express";

import { bracketsManager } from "../services/bracketsManager.js";
import Stage from "../models/stage.js";
import expressAsyncHandler from "express-async-handler";
import { StatusError } from "../middleware/auth.js";

export const getMany = async (req: Request, res: Response) => {
  //FIXME: refactor this better
  const { scheduled, start, stageIds, ...rest } = req.query;

  const filter: any = {
    ...rest,
    tournament: req.params.id
  }

  if (scheduled) {
    filter["start"] = {
      $exists: scheduled === "true",
    }
  } else if (start) {
    filter["start"] = {
      $lt: req.query.end,
    }
  }

  if (stageIds) {
    filter["stage_id"] = {
      $in: stageIds,
    }
  }

  const matches = await Match.find(filter);
  res.send(matches);
};

export const getOne = async (req: Request, res: Response) => {
  const match = await Match.findById(req.params.matchId);
  res.send(match);
};

export const deleteMany = async (req: Request, res: Response) => {
  await Match.deleteMany({});
  res.status(204).send({});
};

export const updateOne = async (req: Request, res: Response) => {
  const updated = await Match.findByIdAndUpdate(req.params.matchId, req.body);
  res.send(updated);
};

//separate endpoint because bracketsManager overwrites the entire opponent subobject
export const updateOpponentResults = expressAsyncHandler(async (req, res) => {
  const matchId = req.params.matchId;
  const opponent = req.params.opponent;

  await bracketsManager.update.match({ [opponent]: req.body, id: matchId });
  res.send({});
})

export const resetResults = expressAsyncHandler(async (req, res) => {
  await bracketsManager.reset.matchResults(req.params.matchId);

  res.status(204).send({});
})

export const resetDates = async (req: Request, res: Response) => {
  const matches = await Match.updateMany({}, { $unset: { start: "" } });
  res.send(matches);
};

export const reportResults = async (req: Request, res: Response) => {
  const updated = await Match.findById(req.body.id);
  res.send(updated);
};
