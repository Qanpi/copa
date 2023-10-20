import mongoose, { InferSchemaType, Types } from "mongoose";
import { collections } from "../configs/db.config.js";
import { UserResponse } from "@azure/cosmos";
import Team from "./team.js";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    googleId: String,
    avatar: String,
    team: {
      id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: collections.teams.id,
        get: (v?: Types.ObjectId) => v?.toString()
      },
      name: String,
    },
    role: {
      type: String,
      enum: ["manager", "admin"],
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true,
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


type TUserVirtuals = { id: string, team?: {id?: string} }
export type TUser = InferSchemaType<typeof UserSchema> & TUserVirtuals;

const User = mongoose.model<TUser>(collections.users.id, UserSchema);
export default User;
