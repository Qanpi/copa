import expressAsyncHandler from "express-async-handler";
import Tournament, { TTournament } from "../models/tournament.js";

import { matchedData } from "express-validator";
import { StatusError } from "../middleware/auth.js";
import { bracketsManager } from "../services/bracketsManager.js";
import Stage from "../models/stage.js";
import Match from "../models/match.js";
import { Status } from "brackets-model";

export const createOne = expressAsyncHandler(async (req, res) => {
  const latest = await Tournament.getLatest();
  if (latest && latest.state !== "Complete")
    throw new Error("An uncompleted tournament already exists.");

  const { divisions, ...tournamentData }: { divisions: string[], tournamentData: Partial<TTournament> } = req.body;

  const newTournament = new Tournament(tournamentData);
  newTournament.divisions.push(...divisions.map((d) => ({ name: d })));

  await newTournament.save();
  res.status(201).send(newTournament);
});

export const getMultiple = expressAsyncHandler(async (req, res) => {
  const results = await Tournament.find({});
  res.send(results);
});

export const getOne = expressAsyncHandler(async (req, res) => {
  const result = await Tournament.findById(req.params.id);
  res.send(result);
});

export const getLatest = expressAsyncHandler(async (req, res) => {
  //FIXME:
  const result = await Tournament.getLatest();
  res.send(result || {});
});

export const updateOne = expressAsyncHandler(async (req, res) => {
  const state = req.body.state as TTournament["state"] | undefined;

  const tournament = await Tournament.findById(req.params.id);

  if (!tournament) 
    throw new StatusError("Invalid tournament", 404);

  //validate admin state change
  if (state && tournament.state !== state) {
    switch (state) { 
      case "Bracket": 
        const stages = await Stage.find({
          type: "round_robin",
          tournament: tournament.id
        });

        const matches = await Match.find({
          tournament: tournament.id,
          stage_id: {
            $in: stages.map(s => s.id)
          }
        })

        //FIXME: assertion !
        const incomplete = matches.filter(m => m.status! < Status.Completed);
        if (incomplete.length !== 0) throw new StatusError("Incomplete matches in the group stage.", 400);
        break;
    }
  }
  
  const result = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.send(result);
});

export const deleteOne = expressAsyncHandler(async (req, res) => {
  //TODO: write properly
  await Tournament.findByIdAndDelete(req.params.id);

  res.status(204).send({});
});

export const getTournamentDataById = expressAsyncHandler(async (req, res) => {
  const data = await bracketsManager.get.tournamentData(req.params.id);
  res.send(data);
});

