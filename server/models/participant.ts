import mongoose, { InferSchemaType, SchemaTypes } from "mongoose";
import { collections } from "../configs/db.config.js";
import { ObjectId } from "mongodb";
import {
  Participant as BracketsParticipant,
  TParticipant as TBracketsParticipant,
} from "brackets-mongo-db";

const ParticipantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    tournament: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: collections.tournaments.id,
    },
    //FIXME: remove
    group_id: {
      type: SchemaTypes.ObjectId,
    },
    team: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: collections.teams.id,
    },
    bannerUrl: String, //deprecated
    //TODO: make this more secure
    phoneNumber: {
      type: String,
      select: false,
    },
  },
  {
    id: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

ParticipantSchema.virtual("createdAt").get(function () {
  return this._id.getTimestamp();
})


export type TParticipant = InferSchemaType<typeof ParticipantSchema> &
  TBracketsParticipant & {id: string, division: string, tournament_id: string};

const Participant = BracketsParticipant.discriminator<TParticipant>(
  "Participant",
  ParticipantSchema
);

export default Participant;
