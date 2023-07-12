import mongoose from "mongoose";
import { collections } from "../configs/db.config.js";

const UserSchema = mongoose.Schema(
  {
    name: String,
    googleId: String,
    avatar: String,
    roles: { type: [String], default: ["viewer"] },
    team: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: collections.teams.id,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

export default mongoose.model(collections.users.id, UserSchema);
