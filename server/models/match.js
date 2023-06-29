import mongoose from "mongoose"
import { collections } from "../configs/db.config.js"

const MatchSchema = new mongoose.Schema({
    team1: {
        team: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: collections.teams.id
        },
        scored: {type: Number}
    }, 
    team2: {
        team: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: collections.teams.id
        },
        scored: {type: Number}
    },
    date: {type: Date},
    status: {type: Boolean}
})


export default mongoose.model(collections.matches.id, MatchSchema);