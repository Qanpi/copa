import mongoose from "mongoose";
import { collections } from "../configs/db.config.js";
import User from "./user.js";

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    about: {
      type: String,
    },
    //refactor to contacts and some separately
    phoneNumber: String,
    instagramUrl: String,
    //one to many, store on the many side
    manager: { type: mongoose.SchemaTypes.ObjectId, ref: collections.users.id },
    // players: [
    //   {
    //     type: mongoose.SchemaTypes.ObjectId,
    //     ref: collections.users.id,
    //   },
    // ],
    invite: {
      token: {
        type: String,
        select: false,
      },
      expiresAt: {
        type: Date,
        select: false,
      },
    },
    //TODO: support for more divisions
    division: {
      type: String,
      enum: ["Men's", "Women's"],
    },
    isRegistered: Boolean,
    matches: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: collections.matches.id,
      },
    ],
    goals: {
      scored: { type: Number },
      conceded: { type: Number },
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

TeamSchema.virtual("players", {
  ref: collections.users.id,
  localField: "_id",
  foreignField: "team",
});

TeamSchema.methods.passManagement = async function () {
  //TODO: test this
  const newManager = await User.findOne({
    team: this.id,
    id: { $ne: this.manager },
  });
  this.manager = newManager ? newManager.id : undefined;
  //TODO: document the fact this doesn't delete the team

  return this.save();
};

export default mongoose.model(collections.teams.id, TeamSchema);
