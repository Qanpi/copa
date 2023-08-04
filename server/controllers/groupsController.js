import expressAsyncHandler from "express-async-handler";
import Tournament from "../models/tournament.js";

export const getMultiple = expressAsyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id)
    .populate({ path: "groups.participants", select: "team"})
    .exec();

  return res.send(tournament.groups);
});

export const createOne = expressAsyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);

  const newGroup = tournament.groups.create(req.body);
  tournament.groups.push(newGroup);
  await tournament.save();

  return res.send(newGroup);
});

export const updateOne = expressAsyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.tournamentId);
  const updated = tournament.groups.id(req.params.groupId).set(req.body);

  await tournament.save();

  return res.send(updated);
});
