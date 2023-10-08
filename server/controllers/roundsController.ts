import Round from "../models/round.ts";
import expressAsyncHandler from "express-async-handler";

export const getMany = expressAsyncHandler(async (req, res) => {
  const filter = req.body;
  const rounds = await Round.find(filter);
  res.send(rounds);
})