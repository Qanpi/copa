import expressAsyncHandler from "express-async-handler";
import Team from "../models/team.js";
import {validate} from "../middleware/validation.js"

export const createOne = expressAsyncHandler(async (req, res) => {
    const newTeam = new Team(req.body);
    await newTeam.save();
    res.send();
});

export const getMultiple = expressAsyncHandler(async (req, res) => {
    const results = await Team.find({});
    res.send(results);
})

export const getOne = expressAsyncHandler(async (req, res) => {
    validate(req, res);

    const result = await Team.findOne({_id: req.params.id});
    res.send(result)
})