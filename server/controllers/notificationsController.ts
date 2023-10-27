import expressAsyncHandler from "express-async-handler";
import Tournament, { TNotification } from "../models/tournament.js";
import { Types } from "mongoose";
import dayjs from "dayjs";

export const getMany = expressAsyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  res.send(tournament?.notifications.sort((a, b) => dayjs(b.createdAt).diff(a.createdAt)));
});

export const createOne = expressAsyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  tournament?.notifications.push(req.body);
  await tournament?.save();

  res.send(tournament);
});

export const removeOne = expressAsyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  tournament?.notifications.pull(req.params.notificationId);
  await tournament?.save();

  res.send(tournament);
});

export const updateOne = expressAsyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);

  if (!tournament)
    throw new Error("Invalid tournament");

  const updateId = req.params.notificationId;
  const updated = tournament.notifications.map(d => d.id === updateId ? req.body : d);
  tournament.notifications = updated as Types.DocumentArray<TNotification>;

  await tournament?.save();
  res.send(tournament);
})