import expressAsyncHandler from "express-async-handler";
import Tournament from "../models/tournament.js";
import Team from "../models/team.js"
import { validate } from "../middleware/validation.js";

export const createOne = expressAsyncHandler(async (req, res) => {
    if (!validate(req, res)) return; //FIXME: change other requests too

    const newTournament = await new Tournament(req.body).save();
    res.send(newTournament);
})

export const getMultiple = expressAsyncHandler(async (req, res) => {
    validate(req, res);

    const results = await Tournament.find({});
    res.send(results);
})

export const getOne = expressAsyncHandler(async (req, res) => {
    validate(req, res);

    const result = await Tournament.findById(req.params.id);
    res.send(result);
})

export const getCurrent = expressAsyncHandler(async (req, res) => {
    validate(req, res);

    const result = await Tournament.findOne({ //TODO: verify that only one not over is possible
        stage: {$ne: "Finished"}
    })
    res.send(result);
})

export const updateOne = expressAsyncHandler(async (req, res) => {
    if (!validate(req, req)) return;

    const result = await Tournament.findByIdAndUpdate(req.params.id, req.body);
    res.send(result)
})

export const getRegisteredTeams = expressAsyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);
    res.send(tournament.teams);
})

export const registerTeam = expressAsyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);
    const team = await Team.findById(req.body.teamId);

    tournament.teams.push({
        id: team.id,
        name: team.name,
        division: team.division
    })

    team.tournaments.push({
        id: tournament.id,
        name: tournament.name
    })

    await tournament.save();
    res.send(await team.save());
})

export const unregisterTeam = expressAsyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.tournamentId);
    const team = await Team.findById(req.params.teamId);

    tournament.teams = tournament.teams.filter(t => t.id != team.id);
    team.tournaments = team.tournaments.filter(t => t.id != tournament.id);

    await tournament.save();
    res.send(await team.save()); //is it weird to return team here?
})