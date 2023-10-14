import expressAsyncHandler from "express-async-handler";
import Division from "../models/division.js";
import Tournament from "../models/tournament.js";

export const createOne = expressAsyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  tournament?.divisions.push(req.body);
  await tournament?.save();

  res.send(tournament);
});

export const readMany = expressAsyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  res.send(tournament?.divisions);
});

export const updateOne = expressAsyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);

  tournament?.divisions.pull(req.params.divisionId);
  tournament?.divisions.push(req.body);
  await tournament?.save;

  res.send(tournament);
})