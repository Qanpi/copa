import { Stage } from "brackets-mongo-db";
import mongoose from "mongoose";

export default Stage.discriminator("Stage",
    new mongoose.Schema({
    }, {
        _id: true
    })
);