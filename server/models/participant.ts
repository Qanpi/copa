import mongoose, { InferSchemaType } from "mongoose";
import { collections } from "../configs/db.config.js";
import { ObjectId } from "mongodb";
import { Participant as BracketsParticipant } from "brackets-mongo-db";

const ParticipantSchema = new mongoose.Schema(
  {
    // tournament: {
    //   type: mongoose.SchemaTypes.ObjectId,
    //   ref: collections.tournaments.id,
    //   // index: true,
    // },
    team: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: collections.teams.id,
    },
    //TODO: make this more secure
    phoneNumber: {
      type: String,
      select: false,
    },
  },
  {
    id: true,
    virtuals: {
      createdAt: {
        get() {
          return this._id.getTimestamp();
        },
      },
    },
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

const Participant = BracketsParticipant.discriminator(
  "Participant",
  ParticipantSchema
);

export type TParticipant = InferSchemaType<typeof Participant.schema>;

export default Participant;
