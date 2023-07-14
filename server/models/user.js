import mongoose from "mongoose";
import { collections } from "../configs/db.config.js";

const UserSchema = mongoose.Schema(
  {
    name: String,
    googleId: String,
    avatar: String,
    team: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: collections.teams.id,
    },
    role: {
      type: String,
      enum: ["manager", "admin"]
    }
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// ROLES
//user - audience, may have a team but not registered
//player - has a team and is registered
//manager - has a team, not necessarily registered but is manager
//admin - admin, not player or any of the others

//looks like i could benefit from
//registered? 
//member, manager
//admin

UserSchema.virtual("isAdmin").get(function () {
  return this.role === "admin";
})

export default mongoose.model(collections.users.id, UserSchema);
