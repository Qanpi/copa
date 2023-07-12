import mongoose from "mongoose";
import { collections } from "../configs/db.config.js";
import User from "./user.js"

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  about: {
    type: String,
  },
  contacts: {
    phoneNumber: String,
    instagramPage: String,
  },
  leader: { type: mongoose.SchemaTypes.ObjectId, ref: collections.users.id },
  players: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: collections.users.id,
    },
  ],
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
});

TeamSchema.post("save", async function () {
  const leader = await User.findById(this.leader);

  leader.roles.push("leader");
  leader.team = this.id;

  this.players.push(leader.id);

  return await leader.save(); 
});

TeamSchema.methods.removePlayer = function (user) {
  //TODO: validation?
  this.players = this.players.filter(player => player !== user.id);
  return this.save();
}

export default mongoose.model(collections.teams.id, TeamSchema);
