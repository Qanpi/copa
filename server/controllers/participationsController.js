import expressAsyncHandler from "express-async-handler";
import Participant from "../models/participant.js";

export const getMany = expressAsyncHandler(async (req, res) => {
  //translateAliases because division = tournament_id;
  const filter = Participant.translateAliases({
    ...req.query,
    tournament: req.params.id,
  });
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
  const participation = await new Participant(
    Participant.translateAliases({ ...req.body, tournament: req.params.id })
  ).save();

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
