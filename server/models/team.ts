import mongoose, { InferSchemaType } from "mongoose";
import { collections } from "../configs/db.config.js";
import User from "./user.js";

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      index: true,
      //do i even need the below? how would an attack vector look?
      set: encodeURIComponent,
      get: decodeURIComponent,
    },
    about: {
      type: String,
    },
    //FIXME: different name on frontend
    instagramUrl: String,
    //one to many, store on the many side
    manager: { type: mongoose.SchemaTypes.ObjectId, ref: collections.users.id },
    // players: [
    //   {
    //     type: mongoose.SchemaTypes.ObjectId,
    //     ref: collections.users.id,
    //   },
    // ],
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

    matches: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: collections.matches.id,
      },
    ],
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

TeamSchema.virtual("members", {
  ref: collections.users.id,
  localField: "_id",
  foreignField: "team",
});

export type TTeam = InferSchemaType<typeof TeamSchema>;

export default mongoose.model(collections.teams.id, TeamSchema);
