import expressAsyncHandler from "express-async-handler";
import Tournament from "../models/tournament.js";
import { validate } from "../middleware/validation.js";

export const createOne = expressAsyncHandler(async (req, res) => {
    if (!validate(req, res)) return; //FIXME: change other requests too

    const newTournament = new Tournament(req.body);
    await newTournament.save();
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
        status: {$ne: "over"}
    })
    res.send(result);
})

export const updateOne = expressAsyncHandler(async (req, res) => {
    if (!validate(req, req)) return;

    const result = await Tournament.findByIdAndUpdate(req.params.id, req.body);
    res.send(result)
})