import mongoose from "mongoose";
import { collections } from "../configs/db.config.js"

const TournamentSchema = mongoose.Schema({
    name: {
        type: String
    },
    season: String,
    year: Number,
})

export default mongoose.model(collections.tournaments.id, TournamentSchema);