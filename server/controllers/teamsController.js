import expressAsyncHandler from "express-async-handler";
import Team from "../models/team.js";
import User from "../models/user.js";
import { validate } from "../middleware/validation.js";
import crypto from "crypto"
import dayjs from "dayjs"

export const createOne = expressAsyncHandler(async (req, res) => {
  const team = await new Team(req.body).save();

  res.send(team);
});

export const getMultiple = expressAsyncHandler(async (req, res) => {
  const filters = {
    ...req.query
  }

  const teams = await Team.find(filters);
  res.send(teams);
});

export const getById = expressAsyncHandler(async (req, res) => {
  validate(req, res);

  const team = await Team.findById(req.params.id);
  res.send(team);
});

export const updateOne = expressAsyncHandler(async (req, res) => {
  const team = await Team.findByIdAndUpdate(req.params.id, req.body, {new: true});
  res.send(team);
})

//is this necessary?
export const getPlayersInTeam = expressAsyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id).populate("players");
  res.send(team.players);
});

export const removePlayerFromTeam = expressAsyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.teamId);
  const user = await User.findById(req.params.playerId); //may be unnecessary query

  if (user.id == team.manager) {
    team.passManagement();
  }

  user.team = undefined;
  await user.save();

  res.status(204).send({});
});

export const joinTeam = expressAsyncHandler(async (req, res) => {
    const token = req.body.token;
    const team = await Team.findById(req.params.id).select(["+invite.token", "+invite.expiresAt"]);

    if (team.invite.token === token && team.invite.expiresAt >= new Date()) {
      await User.findByIdAndJoinTeam(req.user.id, team);
      res.send(team);
    } else {
      res.status(403).send({});
    }
})

export const generateInviteToken = expressAsyncHandler(async (req, res) => {
    //validation of user
    const random = crypto.randomBytes(16);
    const encoded = random.toString("base64url");

    const team = await Team.findById(req.params.id);
    team.invite = {
      token: encoded,
      expiresAt: dayjs().add(1, "day")
    }
    await team.save();

    res.send(team.invite);
})

export const removeById = expressAsyncHandler(async (req, res) => {
  //disband b4 hand
  await Team.findByIdAndRemove(req.params.id);
  res.status(204).send();
});

export const getTournaments = expressAsyncHandler(async (req, res) => {
  
})