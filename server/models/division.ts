import mongoose, { SchemaTypes } from "mongoose";

const DivisionSchema = new mongoose.Schema({
    tournament: SchemaTypes.ObjectId,
    name: String,
    rules: {
        type: String,
    },

    settings: {
        matchLength: {
            type: Number,
            default: 6,
        },
        playerCount: {
            type: Number,
            default: 4,
        },
    },

}, {
    virtuals: {

    },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});

export default mongoose.model("Division", DivisionSchema);