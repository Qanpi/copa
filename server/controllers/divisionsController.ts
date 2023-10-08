import expressAsyncHandler from "express-async-handler";
import Division from "../models/division.ts";

export const createOne = expressAsyncHandler(async (req, res) => {
  const division = await new Division(req.body).save();
  res.send(division);
});

export const readMany = expressAsyncHandler(async (req, res) => {
  const results = await Division.find({});
  res.send(results);
});

export const updateOne = expressAsyncHandler(async (req, res) => {
  const updated = await Division.findByIdAndUpdate(req.params.divisionId, req.body, {
    new: true,
  });

  res.send(updated);
})