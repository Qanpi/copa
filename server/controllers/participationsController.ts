import expressAsyncHandler from "express-async-handler";
import Participant, { TParticipant } from "../models/participant.js";
import { isAdmin, isInTeam, isManagerOrAdmin } from "../middleware/validation.js";
import Team from "../models/team.js";
import { Document, HydratedDocument, Types } from "mongoose";
import Tournament from "../models/tournament.js";

export const getMany = expressAsyncHandler(async (req, res) => {
  //translateAliases because division = tournament_id;
  const filter = Participant.translateAliases({
    ...req.query,
    tournament: req.params.id,
  });

  let participants;
  if (isAdmin(req.user)) {
    participants = await Participant.find(filter).select(["+team.phoneNumber"]);
  } else {
    participants = await Participant.find(filter);
  }

  res.send(participants);
});

export const getOne = expressAsyncHandler(async (req, res) => {
  const part = await Participant.findById(req.params.id);
  res.send(part);
});

export const createOne = expressAsyncHandler(async (req, res) => {
  const team = await Team.findById(req.body.team).exec();

  if (!team)
    throw new Error("Provided team does not exist.")

  if (!isInTeam(req.user, team.id) && !isAdmin(req.user))
    throw new Error("User is not in team and is not admin.")

  const tournament = await Tournament.getLatest();
  if (!tournament.divisions.some(d => d.id === req.body.division))
    throw new Error("The division does not exist in the latest tournament.")

  const participation = await new Participant(
    Participant.translateAliases({ ...req.body, tournament: req.params.id })
  ).save();

  res.status(201).send(participation);
});

export const deleteOne = expressAsyncHandler(async (req, res) => {
  //FIXME: type assertion
  const participant = await Participant.findById(req.params.id) as any;

  if (isAdmin(req.user) || isInTeam(req.user, participant.team)) {
    await participant.deleteOne();
    res.status(204).send({});

    return;
  }

  throw new Error("Unauthorized request.")
});

export const updateOne = expressAsyncHandler(async (req, res) => {
  const participant = await Participant.findById(req.params.id) as any;

  if (isAdmin(req.user) || isInTeam(req.user, participant.team)) {
    const participation = await participant.updateOne(
      req.body,
      { new: true }
    );

    res.send(participation);
  }

  throw new Error("Unauthorized request.")
});
