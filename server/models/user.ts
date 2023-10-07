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
    statics: {
      async findByIdAndJoinTeam(id, team) {
        await User.findByIdAndUpdate(id, {
          team: {
            id: team._id,
            name: team.name,
          },
        });
      },
    },
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

export type TUser = InferSchemaType<typeof UserSchema>;

export default User;
