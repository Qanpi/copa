import { groupBy } from "lodash";
import { getRanking } from "ts-brackets-viewer/dist/helpers";
import { bracketsManager } from "../services/bracketsManager";

export const createStage = async (req, res) => {
  const stage = await bracketsManager.create.stage(req.body);
  res.send(stage);
};

export const updateStage = async (req, res) => {
  //TODO: validation and tournament check
  if (req.body.seedingIds) {
    const bool = await bracketsManager.update.seedingIds(
      req.params.stageId,
      req.body.seedingIds,
      true
    );
  }

  // const stage = await bracketsManager.find.(); 
  //FIXME: may be problematic to use currentStage
  res.send({});
};

export const getCurrentStage = async (req, res) => {
  const stage = await bracketsManager.get.currentStage(req.params.id);
  res.send(stage);
};

export const getStageData = async (req, res) => {
  const stage = await bracketsManager.get.stageData(req.params.stageId);

  res.send(stage);
};

export const getSeeding = async (req, res) => {
  const seeding = await bracketsManager.get.seeding(req.params.stageId);

  return res.send(seeding);
};

export const getStandings = async (req, res) => {
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
