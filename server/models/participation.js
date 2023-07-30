import mongoose from "mongoose"
import { collections } from "../configs/db.config.js"

const ParticipationSchema = new mongoose.Schema({
    group: String,

    team: {
        id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: collections.teams.id,
            required: true,
            index: true
        },
        name: String,
        division: {
            type: String,
            validate: {
                validator: v => {
                    return this.tournament.divisions && this.tournament.divisions.includes(v);
                }
            }
        },
        //TODO: make this more secure
        phoneNumber: {
            type: String,
            select: false,
        }
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

ParticipationSchema.virtual("createdAt").get(function() {
    return this._id.getTimestamp();
})

export default mongoose.model("Participation", ParticipationSchema);
