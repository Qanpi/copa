import mongoose from "mongoose"
import { collections } from "../configs/db.config.js"

const ParticipationSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        index: true,
    },
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
    result: String
})

ParticipationSchema.pre("save", function () {
    //combine two ids into one
    this._id = this.team.id + this.tournament.id;
})

export default mongoose.model("Participation", ParticipationSchema);
