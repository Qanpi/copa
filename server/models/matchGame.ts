import mongoose, { InferSchemaType } from "mongoose";
import { MatchGame as BracketsMatchGame } from "brackets-mongo-db";

const MatchGameSchema = new mongoose.Schema({}, { id: true });

const MatchGame = BracketsMatchGame.discriminator("MatchGame", MatchGameSchema);

export type MatchGame = InferSchemaType<typeof MatchGame.schema>;
export default MatchGame;
