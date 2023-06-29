import mongoose from "mongoose";
import { collections } from "../configs/db.config"

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
            type: mongoose.SchemaType.ObjectId,
            ref: collections.matches.id,
        }
    ],
    goals: {
        scored: {type: Number},
        conceded: {type: Number}
    }
})

mongoose.model(collections.teams.id, TeamSchema)