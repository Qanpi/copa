import User from "../models/user.js";
import Team from "../models/team.js";
import expressAsyncHandler from "express-async-handler";
import { isAdmin, isLoggedInAsUser } from "../middleware/validation.js";
import { StatusError } from "../middleware/auth.js";

export const getMultiple = expressAsyncHandler(async (req, res) => {
  // validate(req, res);

  const results = await User.find(req.query);
  res.send(results);
});

export const createOne = expressAsyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.send(user);
});

export const updateOne = expressAsyncHandler(async (req, res) => {
  if (!isLoggedInAsUser(req.user, req.params.id) && !isAdmin(req.user))
    throw new Error("Unauthorized request.")

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.send(user);
});

export const deleteOne = expressAsyncHandler(async (req, res) => {
  if (!isLoggedInAsUser(req.user, req.params.id) && !isAdmin(req.user))
    throw new Error("Unauthorized request.")

  await User.findByIdAndDelete(req.params.id);
  res.status(204).send({});
});

export const getOneById = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user?.preferences?.publicProfile && !isLoggedInAsUser(req.user, req.params.id) && !isAdmin(req.user)) {
    res.send("private");
    return;
  }

  res.send(user);
});
