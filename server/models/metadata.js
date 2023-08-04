import mongoose from "mongoose"
import { collections } from "../configs/db.config.js";

const ObjectId = mongoose.SchemaTypes.ObjectId;

//TODO: add keeping track of *current* tournament
const MetadataSchema = mongoose.Schema({
    model: {
        type: String,
        required: true,
        index: {unique: true}
    },
    idx: {
        type: Number,
        default: 1,
    },
    latest: {
        type: ObjectId,
        ref: collections.tournaments.id,
    }
})

export default mongoose.model("Metadata", MetadataSchema);