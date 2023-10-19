import { Status } from "brackets-model";
import {
  Match as BracketsMatch,
  TMatch as TBracketsMatch,
} from "brackets-mongo-db";
import mongoose, { DiscriminatorSchema, Document, HydratedDocument, HydratedDocumentFromSchema, InferSchemaType, SchemaTypes } from "mongoose";
import Tournament from "./tournament.js";
import Metadata from "./metadata.js";
import dayjs from "dayjs";
import Stage from "./stage.js";

const MatchSchema = new mongoose.Schema(
  {
    tournament: SchemaTypes.ObjectId,
    start: { type: Date },
    //TODO: validate end exists if start exists
    end: { type: Date },
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

    //FIXME: atrocious code
    // const stage = await Stage.findById(this.stage_id);

    // const current = await Tournament.findById(this.tournament);
    // const division = current?.divisions.find(d => d.id === stage?.division);

    // const defaultDuration = division?.settings?.matchLength || 360;

    // this.end = dayjs(this.start).add(defaultDuration, "seconds").toDate();
  }
})

export type TMatch = { id: string } & InferSchemaType<typeof MatchSchema> & TBracketsMatch;

const Match = BracketsMatch.discriminator<TMatch>("Match", MatchSchema);
export default Match;
