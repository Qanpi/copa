import expressAsyncHandler from "express-async-handler";
import Division, { TDivision } from "../models/division.js";
import Tournament from "../models/tournament.js";
import { Types } from "mongoose";
import { bracketsManager } from "../services/bracketsManager.js";

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

  if (!tournament)
    throw new Error("Invalid tournament");

  const updateId = req.params.divisionId;
  const updated = tournament.divisions.map(d => d.id === updateId ? req.body : d);
  tournament.divisions = updated as Types.DocumentArray<TDivision>;

  await tournament?.save();
  res.send(tournament);
})

export const deleteOne = expressAsyncHandler(async (req, res) => {
  await bracketsManager.delete.tournament(req.params.divisionId);
  res.status(204).send({});
})