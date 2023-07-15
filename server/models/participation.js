import mongoose from "mongoose"
import { collections } from "../configs/db.config.js"

const ParticipationSchema = new mongoose.Schema({
    team: {
        id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: collections.teams.id,
            required: true,
            index: true
        },
        name: String,
        division: String,
    },
    //potentially remove this info in favor of using
    //the tournaments model
    tournament: {
        id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: collections.tournaments.id,
            required: true,
            index: true
        },
        name: String,
        divisions: String,
        result: String,
    },
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

export default mongoose.model("Participation", ParticipationSchema);
