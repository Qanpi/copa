import expressAsyncHandler from "express-async-handler";
import Division from "../models/division.ts";

export const createOne = expressAsyncHandler(async (req, res) => {
  const newTournament = await new Division(req.body).save();
  res.send(newTournament);
});

export const getMultiple = expressAsyncHandler(async (req, res) => {
  const results = await Division.find({});
  res.send(results);
});