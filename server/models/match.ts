import { Status } from "brackets-model";
import {
  Match as BracketsMatch,
  TMatch as TBracketsMatch,
} from "brackets-mongo-db";
import mongoose, { DiscriminatorSchema, Document, HydratedDocument, HydratedDocumentFromSchema, InferSchemaType, ObtainSchemaGeneric, Query, SchemaTypes, Types, isValidObjectId } from "mongoose";
import Tournament from "./tournament.js";
import Metadata from "./metadata.js";
import dayjs from "dayjs";
import Stage from "./stage.js";
import Participant from "./participant.js";

//decided not to bother with discriminators and just implement a participant scheme from scratch
const ParticipantResultSchema = new mongoose.Schema(
  {
    //ref to participant
    id: { type: String }, //for some reason objectId with getters didn't cooperatae
    name: String,

    forfeit: Boolean,
    position: Number,
    result: {
      type: String,
      enum: ["win", "draw", "loss"],
    },
    score: Number,
  },
  {
    _id: false,
    id: false,
    toJSON: {
      getters: true,
    },
    toObject: {
      getters: true
    }
  }
);

const MatchSchema = new mongoose.Schema(
  {
    tournament: SchemaTypes.ObjectId,
    opponent1: ParticipantResultSchema,
    opponent2: ParticipantResultSchema,

    location: String,
    start: { type: Date },
    end: { type: Date }, //TODO: validate end exists if start exists
    // duration: { type: Number, default: 6 }, //in minutes  //FIXME: deprecated
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
      duration: {
        get(this: any) {
          if (!this.start || !this.end) return undefined;
          return dayjs(this.end).diff(this.start, "seconds")
        }
      },
      remaining: {
        get(this: any) {
          return this.duration - this.elapsed;
        }
      }
    },

    id: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

//TODO: test fo robustness
MatchSchema.pre("save", async function () {
  if (this.isNew) {
    const metadata = await Metadata.findOne({
      model: Tournament.modelName
    });
    this.tournament = metadata?.latest;

    //hook into brackets-manager creating stage process
    //check if the participant slot contains an id for opponent
    //if so, auto add the name to use on front-end
    const opp1 = this.opponent1?.id;
    if (isValidObjectId(opp1)) {
      const p1 = await Participant.findById(opp1);
      if (!p1) throw new Error("Invalid participant.")

      this.opponent1!.name = p1.name;
    }

    const opp2 = this.opponent2?.id;
    if (isValidObjectId(opp2)) {
      const p2 = await Participant.findById(opp2);
      if (!p2) throw new Error("Invalid participant.")

      this.opponent2!.name = p2.name;
    }
  }
})

export type TMatch = InferSchemaType<typeof MatchSchema> & TBracketsMatch & ObtainSchemaGeneric<typeof MatchSchema, "TVirtuals">;

const Match = BracketsMatch.discriminator<TMatch>("Match", MatchSchema);
export default Match;
