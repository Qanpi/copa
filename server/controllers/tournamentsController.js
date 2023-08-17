import expressAsyncHandler from "express-async-handler";
import Tournament from "../models/tournament.js";
import Team from "../models/team.js";
import { validate } from "../middleware/validation.js";

export const createOne = expressAsyncHandler(async (req, res) => {
  if (!validate(req, res)) return; //FIXME: change other requests too

  const newTournament = await new Tournament(req.body).save();
  res.send(newTournament);
});

export const getMultiple = expressAsyncHandler(async (req, res) => {
  validate(req, res);

  const results = await Tournament.find({});
  res.send(results);
});

export const getOne = expressAsyncHandler(async (req, res) => {
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    res.send({ errors: validation.array() });
    return false;
  }

  if (req.query.data) {
    console.log("detail requested");
  }

  const result = await Tournament.findById(req.params.id);
  res.send(result);
});

export const getCurrent = expressAsyncHandler(async (req, res) => {
  validate(req, res);

  const result = await Tournament.findOne({
    //TODO: verify that only one not over is possible
    stage: { $ne: "Finished" },
  });
  res.send(result);
});

export const updateOne = expressAsyncHandler(async (req, res) => {
  if (!validate(req, req)) return;

  const result = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.send(result);
});

export const deleteOne = expressAsyncHandler(async (req, res) => {
  await Tournament.findByIdAndDelete(req.params.id);
  res.status(204).send({});
});

export const getRegisteredTeams = expressAsyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  res.send(tournament.teams);
});

export const registerTeam = expressAsyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  const team = await Team.findById(req.body.teamId);

  tournament.teams.push({
    id: team.id,
    name: team.name,
    division: team.division,
  });

  team.tournaments.push({
    id: tournament.id,
    name: tournament.name,
  });

  await tournament.save();
  res.send(await team.save());
});

export const unregisterTeam = expressAsyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.tournamentId);
  const team = await Team.findById(req.params.teamId);

  tournament.teams = tournament.teams.filter((t) => t.id != team.id);
  team.tournaments = team.tournaments.filter((t) => t.id != tournament.id);

  await tournament.save();
  res.send(await team.save()); //is it weird to return team here?
});

import MongooseForBrackets from "../services/brackets/index";
const storage = new MongooseForBrackets();

import { BracketsManager } from "brackets-manager";
import { validationResult } from "express-validator";
const manager = new BracketsManager(storage, true);

export const getTournamentDataById = async (req, res) => {
  const data = await manager.get.tournamentData(req.params.id);
  res.send(data);
};

export const createStage = async (req, res) => {
  const stage = await manager.create.stage(req.body);
  res.send(stage);
};

export const updateStage = async (req, res) => {
  //TODO: validation and tournament check

  if (req.body.seeding) {
    const bool = await manager.update.seeding(
      req.params.stageId,
      req.body.seeding
    );
  }

  const stage = await manager.get.currentStage(); //FIXME: may be problematic to use currentStage
  res.send(stage);
};

export const getCurrentStage = async (req, res) => {
  const stage = await manager.get.currentStage(req.params.id);
  res.send(stage);
}

export const getStageData = async (req, res) => {
  const stage = await manager.get.stageData(req.params.stageId);

  res.send(stage);
};



// groups ?

export const getGroups = expressAsyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id)
    .populate({ path: "groups.participants", select: "team" })
    .exec();

  return res.send(tournament.groups);
});

export const createGroup = expressAsyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);

  const newGroup = tournament.groups.create(req.body);
  tournament.groups.push(newGroup);
  await tournament.save();

  return res.send(newGroup);
});

export const updateGroup = expressAsyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.tournamentId);
  const updated = tournament.groups.id(req.params.groupId).set(req.body);

  await tournament.save();

  return res.send(updated);
});
