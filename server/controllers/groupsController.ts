import Group from "../models/group.js";
import expressAsyncHandler from "express-async-handler";

export const getMany = expressAsyncHandler(async (req, res) => {
  const filter = req.body;
  const groups = await Group.find(filter);
  res.send(groups);
})