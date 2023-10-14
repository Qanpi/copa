import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import mongoose, { InferSchemaType } from "mongoose";
import { romanize } from "../services/helpers.js";
import DivisionSchema from "./division.js";
import Metadata from "./metadata.js";

dayjs.extend(relativeTime);

enum TournamentStates {
  Kickstart,
  Registration,
  Groups,
  Bracket,
  Complete
}

//TODO: split into user and admin models
const TournamentSchema = new mongoose.Schema(
  {
    idx: Number,
    organizer: {
      name: String,
      phoneNumber: String,
    },
    registration: {
      from: Date,
      to: Date,
    },
    state: {
      type: String,
      enum: Object.values(TournamentStates).filter(v => (typeof v === "string")),
      default: "Registration",
    },
    divisions: [DivisionSchema],
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    virtuals: {
      states: {
        get() {
          const statePath = this.schema.path("state") as any;
          return statePath.enumValues;
        },
      },
      name: {
        get() {
          return `Copa ${romanize(this.idx)}`;
        },
      },
    },
  }
);

TournamentSchema.pre("save", async function () {
  if (this.isNew) {
    const name = (this.constructor as any).modelName;

    let metadata = await Metadata.findOne({
      model: name,
    });
    if (!metadata)
      metadata = await Metadata.create({
        model: name,
      });

    this.idx = metadata.idx;

    metadata.idx += 1;
    metadata.latest = this._id;

    await metadata.save();
  }
});

TournamentSchema.virtual("start").get(function () {
  return this._id.getTimestamp();
});

// TournamentSchema.pre("findOneAndDelete", async function () {
//   await Participant.deleteMany({tournament: this.id});
// })

const Tournament = mongoose.model("Tournament", TournamentSchema);

export type TTournament = InferSchemaType<typeof TournamentSchema> & { id: string, state: keyof typeof TournamentStates, states: (keyof typeof TournamentStates)[] };
export default Tournament;
