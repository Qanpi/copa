import mongoose, { InferSchemaType } from "mongoose";
import { collections } from "../configs/db.config.js";
import { ObjectId } from "mongodb";
import BracketsParticipantSchema from "brackets-mongo-db/dist/models/ParticipantSchema";

const BracketsParticipant = mongoose.model(
  "Participant",
  BracketsParticipantSchema
);

const CopaParticipantSchema = new mongoose.Schema(
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

const CopaParticipant = BracketsParticipant.discriminator(
  "CopaParticipant",
  CopaParticipantSchema
);

export type TParticipant = InferSchemaType<typeof CopaParticipant.schema>;

export default CopaParticipant;
