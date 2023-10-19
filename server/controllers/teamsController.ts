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

  const updated = await Team.findByIdAndUpdate(req.params.id, req.body, {new: true}).exec();
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

export const getTeamMembers = expressAsyncHandler(async (req, res) => {
  const members = await User.find({
    "team.id": req.params.teamId,
  })

  res.send(members);
})

export const addUserToTeam = expressAsyncHandler(async (req, res) => {
  const userId: string = req.body.user;

  const team = await Team.findById(req.params.teamId);
  if (!team)
    throw new Error("Invalid team.")

  const updated = await User.findByIdAndUpdate(userId, {
    team
  }, {new: true});

  res.status(201).send(updated);
})

export const joinViaInviteToken = expressAsyncHandler(async (req, res) => {
  const token = req.body.token as string;

  const team = await Team.findById(req.params.id).select(["+invite.token", "+invite.expiresAt"]);

  if (!team)
    throw new Error("Invalid team.")

  //this is to please typescript, there isAuth middleware checking the session
  if (!req.user)
    throw new Error("Strange... no auth.")

  if(req.user?.team) 
    throw new Error("User is already in a team.")

  if (team.invite?.token === token && team.invite.expiresAt && team.invite.expiresAt >= new Date()) {
    const updated = await User.findByIdAndUpdate(req.user.id, {
      team
    });
    res.status(201).send(updated);
  } else {
    throw new Error("Invalid token.")
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
    throw new Error("Neither manager nor admin of team.");

  await team?.deleteOne();
  res.status(204).send();
});

export const getTournaments = expressAsyncHandler(async (req, res) => {

})