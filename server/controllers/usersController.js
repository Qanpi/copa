import User from "../models/user.js"
import expressAsyncHandler from "express-async-handler"

export const getMultiple = expressAsyncHandler(async (req, res) => {
    // validate(req, res);

    const results = await User.find({});
    res.send(results);
})

export const updateOne = expressAsyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});

    res.send(user);
})

export const getOneById = expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    res.send(user);
})