import expressAsyncHandler from "express-async-handler";
import Participation from "../models/participation.js";
import Tournament from "../models/tournament.js";
import Team from "../models/team.js";
import { matchedData, validationResult } from "express-validator";

export const getMultiple = expressAsyncHandler(async (req, res) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    const data = matchedData(req);

    const filters = {
        "team.id": data?.team,
        "tournament.id": data?.tournament
    }

    const participations = await Participation.find(filters);
    return res.send(participations);
  }

  res.send({ errors: result.array() });
});

export const createOne = expressAsyncHandler(async (req, res) => {
  //TODO: remove unnecessary calls
  const team = await Team.findById(req.body.teamId);
  const tournament = await Tournament.findById(req.body.tournamentId);

  const participation = await new Participation({
    team: {
      id: team.id,
      name: team.name,
      division: team.division,
    },
    tournament: {
      id: tournament.id,
      name: tournament.name,
      start: tournament.start,
    },
  }).save();

  res.send(participation);
});

export const deleteOne = expressAsyncHandler(async (req, res) => {
  await Participation.findByIdAndDelete(req.params.id);

  res.status(204).send({});
});
