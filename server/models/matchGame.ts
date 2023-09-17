import MatchGameSchema from "brackets-mongo-db/dist/models/MatchGameSchema"
import mongoose, { InferSchemaType } from "mongoose";

export type MatchGame = InferSchemaType<typeof MatchGameSchema>;

export default mongoose.model("MatchGame", MatchGameSchema);