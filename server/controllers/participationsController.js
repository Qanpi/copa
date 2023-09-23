import expressAsyncHandler from "express-async-handler";
import Participant from "../models/participant.js";
import Tournament from "../models/tournament.js";
import Team from "../models/team.js";
import { matchedData, validationResult } from "express-validator";

export const getMultiple = expressAsyncHandler(async (req, res) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    const data = matchedData(req);

    const filters = {
      "team.id": data?.team,
      "tournament.id": data?.tournament,
      group: data?.group || null,
    };

    //TODO: refactor all other uses to checking role
    const participations =
      req.user?.role === "admin"
        ? await Participant.find(filters).select(["+team.phoneNumber"])
        : await Participant.find(filters);
    return res.send(participations);
  }

  res.send({ errors: result.array() });
});

export const getOne = expressAsyncHandler(async (req, res) => {
  const part = await Participant.findById(req.params.id);
  res.send(part);
});

export const createOne = expressAsyncHandler(async (req, res) => {
  //TODO: remove unnecessary calls
  const team = await Team.findById(req.body.teamId);

  const participation = await new Participant({
    team: team.id,
    name: team.name,
    tournament_id: req.body.tournamentId,
  }).save();

  res.send(participation);
});

export const deleteOne = expressAsyncHandler(async (req, res) => {
  await Participant.findByIdAndDelete(req.params.id);

  res.status(204).send({});
});

export const updateOne = expressAsyncHandler(async (req, res) => {
  //potentially use upsert for better correspondence to http PUT
  const participation = await Participant.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.send(participation);
});
