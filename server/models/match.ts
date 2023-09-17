import { Status } from "brackets-model";
import BracketsMatchSchema from "brackets-mongo-db/dist/models/MatchSchema";
import mongoose, { InferSchemaType } from "mongoose";

const BracketsMatch = await mongoose.model("Match", BracketsMatchSchema);

const CopaMatchSchema = new mongoose.Schema(
  {
    start: { type: Date },
    duration: { type: Number, default: 6 }, //in minutes
  },
  {
    virtuals: {
      verboseStatus: {
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

const CopaMatch = BracketsMatch.discriminator("CopaMatch", CopaMatchSchema);

export type TMatch = InferSchemaType<typeof CopaMatch.schema>;
export default CopaMatch;
