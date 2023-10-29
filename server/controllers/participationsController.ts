import expressAsyncHandler from "express-async-handler";
import Participant, { TParticipant } from "../models/participant.js";
import { isAdmin, isInTeam, isManagerOrAdmin } from "../middleware/validation.js";
import Team from "../models/team.js";
import { Document, HydratedDocument, Types } from "mongoose";
import Tournament from "../models/tournament.js";
import { StatusError } from "../middleware/auth.js";

export const getMany = expressAsyncHandler(async (req, res) => {
  //translateAliases because division = tournament_id;
  const filter = Participant.translateAliases({
    tournament: req.params.id,
    ...req.query,
  });

  let participants;
  if (isAdmin(req.user)) {
    participants = await Participant.find(filter).select("+phoneNumber").populate("team");
  } else {
    participants = await Participant.find(filter).populate("team");
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

  if (!isManagerOrAdmin(req.user, team.manager))
    throw new StatusError("User is not manager and is not admin.", 403)

  const tournament = await Tournament.findById(req.params.id);
  if (!tournament)
    throw new Error("Tournament doesn't exist.")

  if (!tournament.divisions.some(d => d.id === req.body.division))
    throw new Error("The division does not exist in the latest tournament.")

  if(!tournament.registration?.isOpen && !isAdmin(req.user)) {
    throw new Error("Registration is not open.")
  }

  const previous = await Participant.findOne({
    team: team.id,
    tournament: tournament.id
  })

  if (previous)
    throw new Error("Registration for this team already exists in the latest tournament.")

  const participation = await new Participant(
    Participant.translateAliases({ ...req.body, tournament: req.params.id, name: team.name, bannerUrl: team.bannerUrl })
  ).save();

  res.status(201).send(participation);
});

export const deleteOne = expressAsyncHandler(async (req, res) => {
  //FIXME: type assertion
  const participant = await Participant.findById(req.params.id);

  //TODO: unnecessary check, rather save manager to participant in the future
  const team = await Team.findById(participant?.team);

  if (!team || !participant)
    throw new Error("Invalid team or participant");

  const tournament = await Tournament.findById(participant.tournament);
  if (!tournament?.registration || !tournament.registration.isOpen) {
    throw new StatusError("Registration is not in session.", 400);
  }

  if (isManagerOrAdmin(req.user, team.manager)) {
    await participant.deleteOne();
    res.status(204).send({});

    return;
  }

  throw new StatusError("User is neither team manager nor admin.", 403);
});

export const deleteAll = expressAsyncHandler(async (req, res) => {
  await Participant.deleteMany({
    tournament: req.params.id
  });

  res.status(204).send({});
})

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
