import { Status } from "brackets-model";
import {
  Match as BracketsMatch,
  TMatch as TBracketsMatch,
} from "brackets-mongo-db";
import mongoose, { InferSchemaType, SchemaTypes } from "mongoose";
import Tournament from "./tournament.js";
import Metadata from "./metadata.js";

const MatchSchema = new mongoose.Schema(
  {
    tournament: SchemaTypes.ObjectId,
    start: { type: Date },
    duration: { type: Number, default: 6 }, //in minutes
    elapsed: { type: Number, default: 0 } //in seconds
  },
  {
    virtuals: {
      verboseStatus: {
        //FIXME: remove/rework later
        get(this: any) {
          return Status[this.status];
        },
      },
    },

    id: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//TODO: test fo robustness
MatchSchema.pre("save", async function () {
  if (this.isNew) {
    const metadata = await Metadata.findOne({
      model: Tournament.modelName
    });
    this.tournament = metadata?.latest;
  }
})

const Match = BracketsMatch.discriminator("Match", MatchSchema);

export type TMatch = { id: string } & InferSchemaType<typeof MatchSchema> & TBracketsMatch;

export default Match;
