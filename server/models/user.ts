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

//FIXME: garbage code
UserSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();
  // const query = this.getQuery();

  if (update && "team" in update && update.team === null) {
    const user = await this.model.findOne(this.getQuery());
    const team = await Team.findById(user.team.id);

    if (team?.manager?.equals(user._id)) team?.passManagement();
  }
});

const User = mongoose.model(collections.users.id, UserSchema);

type TUserVirtuals = { id: string }
export type TUser = InferSchemaType<typeof UserSchema> & TUserVirtuals;

export default User;
