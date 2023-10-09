import { Stage } from "brackets-mongo-db";
import mongoose, { SchemaTypes } from "mongoose";
import Tournament from "./tournament.js";
import Metadata from "./metadata.js";

const StageSchema = new mongoose.Schema({
    tournament: SchemaTypes.ObjectId
}, {
    _id: true
})

//TODO: test fo robustness
StageSchema.pre("save", async function () {
    if (this.isNew) {
        const metadata = await Metadata.findOne({
            model: Tournament.modelName
        });
        this.tournament = metadata?.latest;
    }
})

export default Stage.discriminator("Stage", StageSchema);