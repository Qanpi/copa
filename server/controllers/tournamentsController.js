import expressAsyncHandler from "express-async-handler";
import Tournament from "../models/tournament.js";

import { bracketsManager } from "../services/bracketsManager.js";

export const createOne = expressAsyncHandler(async (req, res) => {
  const {divisions, ...tournamentData} = req.body;

  const newTournament = new Tournament(tournamentData);
  if (divisions) newTournament.divisions.push(...divisions);

  await newTournament.save();
  res.send(newTournament);
});

export const getMultiple = expressAsyncHandler(async (req, res) => {
  const results = await Tournament.find({});
  res.send(results);
});

export const getOne = expressAsyncHandler(async (req, res) => {
  const result = await Tournament.findById(req.params.id);
  res.send(result);
});

export const getCurrent = expressAsyncHandler(async (req, res) => {
  //FIXME:
  const result = await Tournament.findOne({
  });
  res.send(result || {});
});

export const updateOne = expressAsyncHandler(async (req, res) => {
  const result = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.send(result);
});

export const deleteOne = expressAsyncHandler(async (req, res) => {
  //TODO: test
  await bracketsManager.delete.tournament(req.params.id);
  await Tournament.findByIdAndDelete(req.params.id);
  res.status(204).send({});
});

export const getTournamentDataById = async (req, res) => {
  const data = await bracketsManager.get.tournamentData(req.params.id);
  res.send(data);
};
