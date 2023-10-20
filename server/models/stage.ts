import { Stage as BracketsStage, TStage as TBracketsStage } from "brackets-mongo-db";
import mongoose, { InferSchemaType, SchemaTypes } from "mongoose";
import Tournament from "./tournament.js";
import Metadata from "./metadata.js";

const StageSchema = new mongoose.Schema({
    tournament: SchemaTypes.ObjectId
}, {
    id: true
})

//TODO: test fo robustness
StageSchema.pre("save", async function () {
    if (this.isNew) {
        const metadata = await Metadata.findOne({
            model: Tournament.modelName
        });
        this.tournament = metadata?.latest;
    }
})


export type TStage = InferSchemaType<typeof StageSchema> & TBracketsStage & { id: string, division: string };

const Stage = BracketsStage.discriminator<TStage>("Stage", StageSchema);
export default Stage;