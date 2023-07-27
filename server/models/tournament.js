import mongoose from "mongoose";
import { collections } from "../configs/db.config.js";
import { romanize } from "../services/helpers.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import dayjs from "dayjs";
import Increment from "./increment.js";
dayjs.extend(relativeTime);

//TODO: split into user and admin models
const TournamentSchema = mongoose.Schema(
  {
    count: {
      type: Number,
      default: 1,
    },
    name: {
      type: String,
      default: function () {
        return `Copa ${romanize(this.count)}`;
      },
    },
    settings: {
      matchLength: Number,
      playerCount: Number,
    },
    rules: {
      type: String,
    },
    organizer: {
      name: String,
      phoneNumber: String,
    },
    registration: {
      from: Date,
      to: Date,
    },
    divisions: {
      type: [String],
      default: ["Men's", "Women's"]
    },
    stage: {
      type: String,
      enum: [
        "Kickstart", //meaningless?
        "Registration",
        "Group stage",
        "Play-offs",
        "Finished",
      ],
      default: "Registration",
    },
    end: Date,
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

TournamentSchema.pre("save", async function (next) {
  if (this.isNew) {
    let count = await Increment.getNextId(collections.tournaments.id);
    this.count = count;
  }
  next();
});

TournamentSchema.virtual("stages").get(function () {
  return this.schema.path("stage").enumValues;
});

TournamentSchema.virtual("start").get(function () {
  return this._id.getTimestamp();
});

TournamentSchema.virtual("registration.status").get(function () {
  if (!this.registration.to || !this.registration.from) return "indefinite";

  const now = new Date();
  const { from, to } = this.registration;

  if (now < from) {
    return "awaiting";
  } else if (now <= to) {
    return "in progress";
  } else return "over";
});

// if (this.end) {
//     return ;
// } else if (this.start && now > this.start) {
//     return "Tournament";
// } else if (this.registration.end && now > this.registration.end) {
//     return "Limbo";
// } else if (this.registration.start && now > this.registration.start) {
//     return "Registration";
// } else {
//     return "Announced";
// }

// TournamentSchema.virtual("countDown").get(function () {
//   //announced: "Reg begins in x dyas"
//   //reg: "Reg ends in x days"
//   //limbo: "Tourn begins in x day"
//   //tourn: "nothign"
//   //finsihed: "nothing"
//   const now = new Date();
//   if (now >= this.currentStage.start) {
//     return `${this.currentStage.name} ends in x days`
//   } else {
//     const nextStage = this.stages[this.getCurrentStageId()];
//     return `${nextStage.name} begins in x days`
//   }
// });

export default mongoose.model(collections.tournaments.id, TournamentSchema);
