import mongoose from "mongoose";
import { collections } from "../configs/db.config.js";

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
      validate: {
        validator: (v) => {
          return (
            this.tournament.divisions && this.tournament.divisions.includes(v)
          );
        },
      },
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
      alias: "tournament_id"
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ParticipantSchema.virtual("createdAt").get(function () {
  return this._id.getTimestamp();
});

export default mongoose.model(
  collections.participants.id,
  ParticipantSchema
);
