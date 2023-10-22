import crypto from "crypto";
import dayjs from "dayjs";
import expressAsyncHandler from "express-async-handler";
import Team, { TTeam } from "../models/team.js";
import User, { TUser } from "../models/user.js";
import { Request } from "express";
import { isManagerOrAdmin, isLoggedInAsUser, isAdmin, isInTeam } from "../middleware/validation.js";
import { t } from "ts-brackets-viewer/dist/lang.js";
import { StatusError } from "../middleware/auth.js";
import Participant from "../models/participant.js";

export const createOne = expressAsyncHandler(async (req, res, next) => {
  if (req.user?.team)
    throw new StatusError("Already in a team.", 403)

  if (!isManagerOrAdmin(req.user, req.body.manager))
    throw new StatusError("Neither manager nor admin.", 403)

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

  if (!isManagerOrAdmin(req.user, team.manager))
    throw new Error("Unauthorized request.");

  const updated = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
  res.send(updated);
})

export const removeUserFromTeam = expressAsyncHandler(async (req, res) => {
  const userId = req.params.userId;

  if (!isLoggedInAsUser(req.user, userId) && !isAdmin(req.user))
    throw new StatusError("Unauthorized request.", 403);

  const team = await Team.findById(req.params.teamId);

  if (userId === team?.manager) {
    await team.passManagement();
  }

  await User.findByIdAndUpdate(userId, { "$unset": { "team": "" } });
  res.status(204).send({});
});

export const getUsersInTeam = expressAsyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.teamId);

  if (!team)
    throw new Error("Invalid team.")

  const privateAccess = isAdmin(req.user) || isInTeam(req.user, team.id)

  const members = await User.find({
    "team.id": team.id,
    "preferences.publicProfile": (privateAccess ? undefined : true)
  })

  res.send(members);
})

export const getParticipations = expressAsyncHandler(async (req, res) => {
  const participations = await Participant.find({
    team: req.params.id
  }).populate("tournament");

  res.send(participations);
})

export const addUserToTeam = expressAsyncHandler(async (req, res) => {
  const userId: string = req.body.user;

  const team = await Team.findById(req.params.teamId);
  if (!team)
    throw new Error("Invalid team.")

  const updated = await User.findByIdAndUpdate(userId, {
    team
  }, { new: true });

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

  if (req.user?.team)
    throw new StatusError("User is already in a team.", 403)

  if (team.invite?.token === token && team.invite.expiresAt && team.invite.expiresAt >= new Date()) {
    const updated = await User.findByIdAndUpdate(req.user.id, {
      team
    }, { new: true });
    res.status(201).send(updated);
  } else {
    throw new StatusError("Invalid token.", 403)
  }
})

export const generateInviteToken = expressAsyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team)
    throw new Error("Invalid team.")

  if (!isManagerOrAdmin(req.user, team.manager))
    throw new StatusError("Neither manager nor in team.", 403);

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

  if (!team) {
    res.status(204).send();
    return;
  }

  if (!isManagerOrAdmin(req.user, team.manager))
    throw new Error("Neither manager nor admin of team.");

  await Team.findByIdAndDelete(team.id);
  res.status(204).send();
});

export const getTournaments = expressAsyncHandler(async (req, res) => {

})