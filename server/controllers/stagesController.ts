import { groupBy } from "lodash-es";
import { getRanking } from "ts-brackets-viewer/dist/helpers.js";
import { bracketsManager } from "../services/bracketsManager.js";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import Stage from "../models/stage.js";
import { Match } from "brackets-model";

export const createStage = expressAsyncHandler(async (req, res) => {
  const stage = await bracketsManager.create.stage(req.body);
  res.send(stage);
});

export const getMany = expressAsyncHandler(async (req, res) => {
  const filter = Stage.translateAliases({
    ...req.query,
  });
  const stages = await Stage.find(filter);
  res.send(stages);
})

export const updateStage = expressAsyncHandler(async (req, res) => {
  //TODO: validation =and tournament check
  if (req.body.seedingIds) {
    const bool = await bracketsManager.update.seedingIds(
      req.params.stageId,
      req.body.seedingIds,
    );
  }

  // const stage = await bracketsManager.find.(); 
  //FIXME: may be problematic to use currentStage
  res.send({});
});

export const deleteOne = expressAsyncHandler(async (req, res) => {
  await bracketsManager.delete.stage(req.params.stageId);
  res.status(204).send({});
});

export const getCurrentStage = expressAsyncHandler(async (req, res) => {
  const stage = await bracketsManager.get.currentStage(req.params.id);
  res.send(stage);
});

export const getStageData = expressAsyncHandler(async (req, res) => {
  const stage = await bracketsManager.get.stageData(req.params.stageId);

  res.send(stage);
});

export const getSeeding = expressAsyncHandler(async (req, res) => {
  const seeding = await bracketsManager.get.seeding(req.params.stageId);

 res.send(seeding);
});

export const getStandings = expressAsyncHandler(async (req, res) => {
  const stageData = await bracketsManager.get.stageData(req.params.stageId);

  if (stageData.stage[0].type === "round_robin") {
    const matches = stageData.match;
    const groupedMatches = Object.values(groupBy(matches, "group_id")) as Match[][];

    const standings = groupedMatches.map((m) => getRanking(m));
    res.send(standings);
  } else {
    const standings = await bracketsManager.get.finalStandings(req.params.stageId);
    res.send(standings);
  }
});
