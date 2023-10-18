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

  const tournament = await Tournament.findById(req.params.id);
  if (!tournament)
    throw new Error("Tournament doesn't exist.")

  if (!tournament.divisions.some(d => d.id === req.body.division))
    throw new Error("The division does not exist in the latest tournament.")

  const from = tournament.registration?.from;
  const to = tournament.registration?.to;

  if (!from || from >= new Date())
    throw new Error("Registration isn't open yet.")

  if (to && to <= new Date())
    throw new Error("Registration is already over.")

  const previous = await Participant.findOne({
    team: team.id,
    tournament: tournament.id
  })

  if (previous)
    throw new Error("Registration for this team already exists in the latest tournament.")

  const participation = await new Participant(
    Participant.translateAliases({ ...req.body, tournament: req.params.id })
  ).save();

  res.status(201).send(participation);
});

export const deleteOne = expressAsyncHandler(async (req, res) => {
  //FIXME: type assertion
  const participant = await Participant.findById(req.params.id);

  if (!participant?.team)
    throw new Error("Invalid team or participant");

  if (isAdmin(req.user) || isInTeam(req.user, participant.team.toString())) {
    await participant.deleteOne();
    res.status(204).send({});

    return;
  }

  throw new Error("User is neither in team nor admin.")
});

export const updateOne = expressAsyncHandler(async (req, res) => {
  const participant = await Participant.findById(req.params.id);

  if (!participant?.team)
    throw new Error("Invalid team or participant.")

  if (isAdmin(req.user) || isInTeam(req.user, participant.team.toString())) {
    const participation = await Participant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.send(participation);
  }

  throw new Error("Unauthorized request.")
});
