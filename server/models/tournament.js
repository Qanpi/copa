import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import mongoose from "mongoose";
import { collections } from "../configs/db.config.js";
import { romanize } from "../services/helpers.js";

import { Tournament as BracketsTournament } from "brackets-mongo-db";

import { GroupSchema, RoundSchema, StageSchema } from "brackets-mongo-db";

dayjs.extend(relativeTime);

GroupSchema.virtual("name").get(function () {
  const alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase();

  return `Group ${alphabet[this.number - 1]}`;
});

GroupSchema.virtual("participants", {
  ref: collections.participants.id,
  localField: "_id",
  foreignField: "group",
});

// export const Group = mongoose.model(collections.groups.id, GroupSchema);

//TODO: split into user and admin models
const TournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: function () {
        return `Copa ${romanize(this.idx)}`;
      },
    },
    settings: {
      matchLength: {
        type: Number,
        default: 6,
      },
      playerCount: {
        type: Number,
        default: 4,
      },
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
      default: ["Men's", "Women's"],
    },
    groups: [GroupSchema],
    stages: [StageSchema],
    rounds: [RoundSchema],

    stage: {
      //FIXME: rename to avoid confusion with brackets stages
      type: String,
      enum: ["Registration", "Group stage", "Bracket", "Over"],
      default: "Registration",
    },
    end: Date,
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    // statics: {
      // async findLatest() {
      //   const meta = await Metadata.findOne({
      //     model: collections.tournaments.id,
      //   });
      //   const tournament = await this.findById(meta.latest);
      //   return tournament;
      // },
    // },
  }
);

//FIXME: renamed var
TournamentSchema.virtual("statuses").get(function () {
  return this.schema.path("stage").enumValues;
});

TournamentSchema.virtual("stageId").get(function () {
  return this.statuses.indexOf(this.stage);
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

TournamentSchema.virtual("groupStage").get(function () {
  return this.stages.find((s) => s.type === "round_robin"); //TODO: allow for multiple (divisions)
});

// TournamentSchema.pre("findOneAndDelete", async function () {
//   await Participant.deleteMany({tournament: this.id});
// })

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

const Tournament = BracketsTournament.discriminator(
  "Tournament",
  TournamentSchema
);

export default Tournament;
