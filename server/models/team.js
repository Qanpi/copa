import mongoose from "mongoose";
import { collections } from "../configs/db.config.js"

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    players: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: collections.players.id,
        }
    ],
    matches: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: collections.matches.id,
        }
    ],
    goals: {
        scored: {type: Number},
        conceded: {type: Number}
    }
})


export default mongoose.model(collections.teams.id, TeamSchema);