import { Status } from "brackets-model";
import { Match as BracketsMatch } from "brackets-mongo-db";
import mongoose, { InferSchemaType } from "mongoose";

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

export type TMatch = InferSchemaType<typeof Match.schema>;

export default Match;
