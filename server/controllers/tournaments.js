import expressAsyncHandler from "express-async-handler";
import Tournament from "../models/tournament.js"
import { validate } from "../middleware/validation.js";

export const createOne = expressAsyncHandler(async (req, res) => {
    validate(req, res);

    const newTournament = new Tournament(req.body);
    await newTournament.save();
    res.send(`Sucessfully created tournament "${newTournament.name}".`);
})

export const getMultiple = expressAsyncHandler(async (req, res) => {
    validate(req, res);

    const results = await Tournament.find({});
    res.send(results);
})