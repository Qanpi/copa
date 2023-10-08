import mongoose, { SchemaTypes } from "mongoose";

const DivisionSchema = new mongoose.Schema({
    tournament: SchemaTypes.ObjectId,
    name: String,
    rules: {
        type: String,
    },
    registration: {
        from: Date,
        to: Date,
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
    state: {
        type: String,
        enum: ["Kickstart", "Registration", "Group stage", "Bracket", "Complete"],
        default: "Registration",
    },
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});

export default mongoose.model("Division", DivisionSchema);