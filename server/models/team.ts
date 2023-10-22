import mongoose, { InferSchemaType, ObtainSchemaGeneric, Types } from "mongoose";
import { collections } from "../configs/db.config.js";
import User from "./user.js";
import mongooseUniqueValidator from "mongoose-unique-validator";

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
    bannerUrl: String,
    phoneNumber: String,

    manager: { type: mongoose.SchemaTypes.ObjectId, ref: collections.users.id, get: (v: Types.ObjectId) => v.toString(), unique: true },

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
        const newManager = await User.findOne({
          "team.id": this.id,
          _id: { $ne: this.manager },
        });

        if (newManager) {
          return await this.save();
        } else {
          await this.deleteOne();
          return;
        }
      },
    },
    virtuals: {
      createdAt: {
        get() {
          return this._id.getTimestamp() as Date;
        }
      }
    },
    timestamps: true,
    id: true,
    _id: true,
  }
);

TeamSchema.plugin(mongooseUniqueValidator);

TeamSchema.pre("save", async function () {
  if (this.isNew) {
    await User.findByIdAndUpdate(this.manager, {
      team: this
    });
  }
});

TeamSchema.pre("deleteOne", async function () {
  const members = await User.find({ team: this.getFilter()._id });

  for (const m of members) {
    m.team = undefined;
    await m.save();
  }
})

export type TTeam = InferSchemaType<typeof TeamSchema> & ObtainSchemaGeneric<typeof TeamSchema, "TVirtuals"> & ObtainSchemaGeneric<typeof TeamSchema, "TInstanceMethods"> & { manager: string, id: string };

export default mongoose.model<TTeam>(collections.teams.id, TeamSchema);
