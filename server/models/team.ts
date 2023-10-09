import mongoose, { InferSchemaType } from "mongoose";
import { collections } from "../configs/db.config.js";
import User from "./user.js";

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      index: true,
      //TODO: do i even need the below? how would an attack vector look?
      set: encodeURIComponent,
      get: decodeURIComponent,
    },
    about: {
      type: String,
    },
    instagramUrl: String,
    phoneNumber: String,

    manager: { type: mongoose.SchemaTypes.ObjectId, ref: collections.users.id },

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

    goals: {
      scored: { type: Number },
      conceded: { type: Number },
    },
  },
  {
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true },
    methods: {
      async passManagement() {
        //TODO: test this
        const newManager = await User.findOne({
          team: this.id,
          id: { $ne: this.manager },
        });
        this.manager = newManager ? newManager.id : undefined;
        //TODO: document the fact this doesn't delete the team

        return this.save();
      },
    },
  }
);

TeamSchema.pre("save", async function () {
  if (this.isNew) {
    User.findByIdAndJoinTeam(this.manager, this);
  }
});

type TTeamVirtuals = { id: string };
export type TTeam = InferSchemaType<typeof TeamSchema> & TTeamVirtuals;

export default mongoose.model(collections.teams.id, TeamSchema);
