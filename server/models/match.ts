import mongoose, { HydratedArraySubdocument, HydratedDocumentFromSchema, HydratedSingleSubdocument, InferSchemaType, VirtualType } from "mongoose";
import { collections } from "../configs/db.config.js";
import { Status } from "brackets-model";

const ObjectId = mongoose.SchemaTypes.ObjectId;

const ParticipantResultSchema = new mongoose.Schema(
  {
    forfeit: Boolean,
    name: String,
    id: {
      type: ObjectId,
      ref: collections.participants.id,
    },
    position: Number,
    result: {
      type: String,
      enum: ["win", "draw", "loss"],
    },
    score: Number,
  },
  { _id: false }
);

const MatchGameSchema = new mongoose.Schema(
  {
    number: Number,
    opponent1: ParticipantResultSchema,
    opponent2: ParticipantResultSchema,
    status: {
      type: Number,
      enum: Status,
    },
  },
  {
    virtuals: {
      parent_id: {
        get() {
          return this.$parent()?._id;
        },
      },

      stage_id: {
        get() {
          return (this.$parent() as any)?.stage; //FIXME: not typesafe because circular ref
        },
      },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

type MatchGameVirtuals = {
  parent_id: string;
  stage_id: string;
};

export type MatchGame = InferSchemaType<typeof MatchGameSchema> & MatchGameVirtuals; 

const MatchSchema = new mongoose.Schema(
  {
    childCount: {
      type: Number,
      alias: "child_count",
    },
    group: {
      type: ObjectId,
      ref: collections.groups.id,
      alias: "group_id",
    },
    number: Number,
    opponent1: ParticipantResultSchema,
    opponent2: ParticipantResultSchema,
    round: {
      type: ObjectId,
      ref: collections.rounds.id,
      alias: "round_id",
    },
    stage: {
      type: ObjectId,
      ref: collections.stages.id,
      alias: "stage_id",
    },
    status: {
      type: Number,
      enum: Status,
      required: true, //FIXME: default? 
    },
    games: [MatchGameSchema],

    // team1: {
    //     team: {
    //         type: mongoose.SchemaTypes.ObjectId,
    //         ref: collections.teams.id
    //     },
    //     scored: {type: Number}
    // },
    // team2: {
    //     team: {
    //         type: mongoose.SchemaTypes.ObjectId,
    //         ref: collections.teams.id
    //     },
    //     scored: {type: Number}
    // },
    start: { type: Date },
    duration: {type: Number, default: 6} //in minutes
  },
  {
    virtuals: {
      verboseStatus: {
        get() {
          return Status[this.status];
        }
      }
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

type MatchVirtuals = {
  verboseStatus: string;
  id: string;
}

export type Match = InferSchemaType<typeof MatchSchema> & MatchVirtuals;

export default mongoose.model(collections.matches.id, MatchSchema);
