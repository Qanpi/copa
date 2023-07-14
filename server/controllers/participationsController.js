import expressAsyncHandler from "express-async-handler";
import Participation from "../models/participation.js";
import Tournament from "../models/tournament.js";
import Team from "../models/team.js";

export const getMultiple = expressAsyncHandler(async (req, res) => {
    const participations = await Participation.find({});
    res.send(participations);
}) 

export const createOne = expressAsyncHandler(async (req, res) => {
    //TODO: remove unnecessary calls
    console.log(req.body)
    const team = await Team.findById(req.body.teamId);
    console.log(team);
    const tournament = await Tournament.findById(req.body.tournamentId);

    const participation = await new Participation({
        team: {
            id: team.id,
            name: team.name,
            division: team.division
        },
        tournament: {
            id: tournament.id,
            name: tournament.name,
            start: tournament.start,
            end: tournament.end,
        }
    }).save();

    res.send(participation);
})

export const deleteOne = expressAsyncHandler(async (req, res) => {
    await Participation.findByIdAndDelete(req.params.id);

    res.status(204).send({})
})