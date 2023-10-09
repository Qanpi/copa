import Group from "../models/group.ts";
import expressAsyncHandler from "express-async-handler";

export const getMany = expressAsyncHandler(async (req, res) => {
  const filter = req.body;
  const groups = await Group.find(filter);
  res.send(groups);
})