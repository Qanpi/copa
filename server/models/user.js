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

UserSchema.virtual("isMember").get(function () {
  return this.team !== undefined; //and registered!
})

export default mongoose.model(collections.users.id, UserSchema);
