import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { collections } from "../configs/db.config.js";
import { romanize } from "../services/helpers.js";
import Metadata from "./metadata.js";
dayjs.extend(relativeTime);

const RoundSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: collections.groups.id,
      alias: "group_id",
    },
    number: Number,
    stage: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: collections.stages.id,
      alias: "stage_id",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const Round = mongoose.model(collections.rounds.id, RoundSchema);

const StageSchema = new mongoose.Schema(
  {
    name: String,
    number: Number,
    settings: {
      size: Number,
      seedOrdering: {
        type: [String],
        enum: [
          "natural",
          "reverse",
          "half_shift",
          "reverse_half_shift",
          "pair_flip",
          "inner_outer",
          "groups.effort_balanced",
          "groups.seed_optimized",
          "groups.bracket_optimized",
        ],
      },
      balanceByes: Boolean,
      consolationFinal: Boolean,
      grandFinal: {
        type: String,
        enum: ["none", "simple", "double"],
      },
      groupCount: Number,
      manualGrouping: [[Number]],
      matchesChildCount: Number,
      roundRobinMode: {
        type: String,
        enum: ["simple", "double"],
      },
      skipFirstRound: Boolean,
    },
    type: {
      type: String,
      enum: ["round_robin", "single_elimination", "double_elimination"],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

StageSchema.virtual("tournament_id").get(function () {
  return this.parent()._id;
});

//FIXME: remove superfluous model creation
export const Stage = mongoose.model(collections.stages.id, StageSchema);

export const GroupSchema = new mongoose.Schema(
  {
    number: Number,
    stage: {
      type: mongoose.SchemaTypes.ObjectId,
      alias: "stage_id",
    },
    division: String,
    options: {
      breakingCount: Number,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

GroupSchema.virtual("name").get(function() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase();

  return `Group ${alphabet[this.number - 1]}`;
})

GroupSchema.virtual("participants", {
  ref: collections.participants.id,
  localField: "_id",
  foreignField: "group",
});

// export const Group = mongoose.model(collections.groups.id, GroupSchema);

//TODO: split into user and admin models
const TournamentSchema = new mongoose.Schema(
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
    groups: [GroupSchema],
    divisions: {
      type: [String],
      default: ["Men's", "Women's"],
    },
    stages: [StageSchema],
    rounds: [RoundSchema],

    stage: {
      //FIXME: rename to avoid confusion with brackets stages
      type: String,
      enum: [
        "Settings",
        "Registration",
        "Group stage",
        "Play-offs",
        "Finished",
      ],
      default: "Settings",
    },
    end: Date,
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    statics: {
      async findCurrent() {
        const meta = await Metadata.findOne({
          model: collections.tournaments.id,
        });
        const tournament = await this.findById(meta.latest);
        return tournament;
      },
      translateSubAliases(subdoc, obj) {
        switch (subdoc) {
          case "group":
            if (obj.stage_id) {
              obj.stage = new ObjectId(obj.stage_id);
              delete obj.stage_id;
            }
            break;
          case "stage":
            if (obj.tournament_id) {
              obj.tournament_id = new ObjectId(obj.tournament_id);
            }
            break;
          case "round":
            if (obj.group_id) {
              obj.group = new ObjectId(obj.group_id);
              delete obj.group_id;
            }
            if (obj.stage_id) {
              obj.stage = new ObjectId(obj.stage_id);
              delete obj.stage_id;
            }
            break;
        }
        return obj;
      },
    },
  }
);

TournamentSchema.pre("save", async function (next) {
  if (this.isNew) {
    let metadata = await Metadata.findOne({
      model: collections.tournaments.id,
    });
    if (!metadata)
      metadata = new Metadata({ model: collections.tournaments.id });

    this.count = metadata.count;
    metadata.idx++;
    metadata.latest = this._id;

    await metadata.save();
  }
  next();
});

//FIXME: renamed var
TournamentSchema.virtual("statuses").get(function () {
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

TournamentSchema.virtual("groupStage").get(function() {
    return this.stages.find((s) => s.type === "round_robin"); //TODO: allow for multiple (divisions)
})

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

export default mongoose.model(collections.tournaments.id, TournamentSchema);
