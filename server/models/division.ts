import mongoose, { InferSchemaType, SchemaTypes } from "mongoose";

const DivisionSchema = new mongoose.Schema({
    name: String,
    rules: {
        type: String,
    },

    settings: {
        matchLength: {
            type: Number,
            default: 360, //in seconds
            required: true,
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

export type TDivision = InferSchemaType<typeof DivisionSchema> & {id: string};

export default DivisionSchema;