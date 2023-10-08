import { groupBy } from "lodash-es";
import { getRanking } from "ts-brackets-viewer/dist/helpers.js";
import { bracketsManager } from "../services/bracketsManager.js";
import { Request, Response } from "express";

export const createStage = async (req: Request, res: Response) => {
  const stage = await bracketsManager.create.stage(req.body);
  res.send(stage);
};

export const updateStage = async (req: Request, res: Response) => {
  //TODO: validation and tournament check
  if (req.body.seedingIds) {
    const bool = await bracketsManager.update.seedingIds(
      req.params.stageId,
      req.body.seedingIds,
    );
  }

  // const stage = await bracketsManager.find.(); 
  //FIXME: may be problematic to use currentStage
  res.send({});
};

export const getCurrentStage = async (req: Request, res: Response) => {
  const stage = await bracketsManager.get.currentStage(req.params.id);
  res.send(stage);
};

export const getStageData = async (req: Request, res: Response) => {
  const stage = await bracketsManager.get.stageData(req.params.stageId);

  res.send(stage);
};

export const getSeeding = async (req: Request, res: Response) => {
  const seeding = await bracketsManager.get.seeding(req.params.stageId);

  return res.send(seeding);
};

export const getStandings = async (req: Request, res: Response) => {
  const stageData = await bracketsManager.get.stageData(req.params.stageId);

  if (stageData.stage[0].type === "round_robin") {
    const matches = stageData.match;
    const groupedMatches = Object.values(groupBy(matches, "group_id"));

    const standings = groupedMatches.map((m) => getRanking(m));
    return res.send(standings);
  } else {
    const standings = await bracketsManager.get.finalStandings(req.params.stageId);
    return res.send(standings);
  }
};
