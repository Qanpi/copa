import mongoose, { InferSchemaType } from "mongoose";
import { collections } from "../configs/db.config.js";
import { ObjectId } from "mongodb";

const ParticipantSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: collections.groups.id,
    },

    name: String, //TODO: consider what happens when you change name midtournament
    team: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: collections.teams.id,
    },

    division: {
      type: String,
    },
    //TODO: make this more secure
    phoneNumber: {
      type: String,
      select: false,
    },
    //TODO: index  this and team fields
    tournament: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: collections.tournaments.id,
      alias: "tournament_id",
      index: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

type ParticipantVirtuals = {
  createdAt: Date;
  id: ObjectId;
};

ParticipantSchema.virtual("createdAt").get(function () {
  return this._id.getTimestamp();
});

export type Participant = InferSchemaType<typeof ParticipantSchema> &
  ParticipantVirtuals;

export default mongoose.model(collections.participants.id, ParticipantSchema);
