import crypto from "crypto";
import dayjs from "dayjs";
import expressAsyncHandler from "express-async-handler";
import Team, { TTeam } from "../models/team.js";
import User, { TUser } from "../models/user.js";
import { Request } from "express";
import { isManagerOrAdmin, isLoggedInAsUser, isAdmin } from "../middleware/validation.js";
import { t } from "ts-brackets-viewer/dist/lang.js";

export const createOne = expressAsyncHandler(async (req, res, next) => {
  const team = await Team.create(req.body);

  res.status(201).send(team);
});

export const getMultiple = expressAsyncHandler(async (req, res) => {
  const filters = {
    ...req.query
  }

  const teams = await Team.find(filters);
  res.send(teams);
});

export const getById = expressAsyncHandler(async (req, res) => {
  let query = Team.findById(req.params.id);

  if (isAdmin(req.user)) {
    const team = await query.select("+invite.token +invite.expiresAt +phoneNumber");
    res.send(team);
    return
  }

  const team = await query.exec();
  res.send(team);
});

export const updateOne = expressAsyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team)
    throw new Error("Team not found.")

  if (!isManagerOrAdmin(req.user, team.manager?.toString()))
    throw new Error("Unauthorized request.");

  const updated = await team.updateOne(req.body, { new: true }).exec();
  res.send(updated);
})

export const getUsersInTeam = expressAsyncHandler(async (req, res) => {
  const players = await User.find({ team: req.params.id });
  res.send(players);
});

export const removeUserFromTeam = expressAsyncHandler(async (req, res) => {
  const userId = req.params.userId;

  if (!isLoggedInAsUser(req.user, userId) && !isAdmin(req.user))
    throw new Error("Unauthorized request.");

  const team = await Team.findById(req.params.teamId);
  if (!team)
    throw new Error("Invalid team.")

  if (userId === team.manager?.toString()) {
    await team.passManagement();
  }

  await User.findByIdAndUpdate(userId, { "$unset": { "team": "" } });
  res.status(204).send({});
});

export const addUserToTeam = expressAsyncHandler(async (req, res) => {
  const token = req.body.token as string;
  const userId = req.body.userId as string;

  if (!isLoggedInAsUser(req.user, userId) && !isAdmin(req.user))
    throw new Error("Unauthorized request.")

  const team = await Team.findById(req.params.id).select(["+invite.token", "+invite.expiresAt"]);

  if (!team)
    throw new Error("Invalid team.")

  if (team.invite?.token === token && team.invite.expiresAt && team.invite.expiresAt >= new Date()) {
    const updated = await User.findByIdAndUpdate(userId, {
      team
    });
    res.send(updated);
  } else {
    res.status(403).send({ error: "invalid token" });
  }
})

export const generateInviteToken = expressAsyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team)
    throw new Error("Invalid team.")

  if (!isManagerOrAdmin(req.user, team.manager?.toString()))
    throw new Error("Unauthorized request");

  const random = crypto.randomBytes(16);
  const encoded = random.toString("base64url");

  team.invite = {
    token: encoded,
    expiresAt: dayjs().add(1, "day").toDate()
  }
  await team.save();

  res.send(team.invite);
})

export const removeById = expressAsyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!isManagerOrAdmin(req.user, team?.manager?.toString()))
    throw new Error("Unauthorized request.");

  await team?.deleteOne();
  res.status(204).send();
});

export const getTournaments = expressAsyncHandler(async (req, res) => {

})