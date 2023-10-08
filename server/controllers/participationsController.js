import expressAsyncHandler from "express-async-handler";
import Participant from "../models/participant.js";
import Tournament from "../models/tournament.js";
import Team from "../models/team.js";
import { matchedData, validationResult } from "express-validator";

export const getMany = expressAsyncHandler(async (req, res) => {
  const filter = {
    ...req.query,
    tournament_id: req.params.id
  }
  //TODO: refactor all other uses to checking role
  const participants =
    req.user?.role === "admin"
      ? await Participant.find(filter).select(["+team.phoneNumber"])
      : await Participant.find(filter);
  return res.send(participants);
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
    tournament_id: req.params.id,
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
