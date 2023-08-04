import mongoose from "mongoose";
import { collections } from "../configs/db.config.js";
import { Status } from "brackets-model";

const ObjectId = mongoose.SchemaTypes.ObjectId;

const ParticipantResultSchema = new mongoose.Schema(
  {
    forfeit: Boolean,
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
      enum: Status
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

MatchGameSchema.virtual("parent_id", function () {
  return this.parent()._id;
});

MatchGameSchema.virtual("stage_id", function () {
  return this.parent().stage_id;
});

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
    date: { type: Date },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.model(collections.matches.id, MatchSchema);
