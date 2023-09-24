import { Status } from "brackets-model";
import {
  Match as BracketsMatch,
  TMatch as TBracketsMatch,
} from "brackets-mongo-db";
import mongoose, { InferSchemaType, SchemaTypes } from "mongoose";

const MatchSchema = new mongoose.Schema(
  {
    start: { type: Date },
    duration: { type: Number, default: 6 }, //in minutes
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

const Match = BracketsMatch.discriminator("Match", MatchSchema);

export type TMatch = InferSchemaType<typeof MatchSchema> & TBracketsMatch;

export default Match;
