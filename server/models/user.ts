import mongoose, { InferSchemaType } from "mongoose";
import { collections } from "../configs/db.config.js";
import { UserResponse } from "@azure/cosmos";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    googleId: String,
    avatar: String,
    team: {
      id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: collections.teams.id,
      },
      name: {
        type: String
      }
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

const User = mongoose.model(collections.users.id, UserSchema);

export type TUser = InferSchemaType<typeof UserSchema>;

export default User;
