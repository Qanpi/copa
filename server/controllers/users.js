import User from "../models/user.js"
import expressAsyncHandler from "express-async-handler"

export const getMultiple = expressAsyncHandler(async (req, res) => {
    // validate(req, res);

    const results = await User.find({});
    res.send(results);
})