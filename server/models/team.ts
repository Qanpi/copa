import mongoose, { InferSchemaType, Types } from "mongoose";
import { collections } from "../configs/db.config.js";
import User from "./user.js";
import uniqueValidator from "mongoose-unique-validator";

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

    manager: { type: mongoose.SchemaTypes.ObjectId, ref: collections.users.id, get: (v: Types.ObjectId) => v.toString(), required: true },

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
    toObject: { virtuals: true, getters: true },
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

TeamSchema.plugin(uniqueValidator);

TeamSchema.pre("save", async function () {
  if (this.isNew) {
    await User.findByIdAndUpdate(this.manager, {
      team: this
    });
  }
});

TeamSchema.pre("deleteOne", async function (this: TTeam) {
  const members = await User.find({ team: this.id });

  for (const m of members) {
    m.team = null;
    await m.save();
  }
})

type TTeamVirtuals = { id: string, manager: string };
export type TTeam = InferSchemaType<typeof TeamSchema> & TTeamVirtuals;

export default mongoose.model(collections.teams.id, TeamSchema);
