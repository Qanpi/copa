import mongoose from "mongoose";
import { collections } from "../configs/db.config.js";
import { romanize } from "../services/helpers.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import dayjs from "dayjs";
import Increment from "./increment.js";
dayjs.extend(relativeTime);

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
      locationId: Number,
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
    stageId: {
      type: Number,
      default: 1
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

//const stages = ["Announced", "Registration", "Limbo", "Tournament", "Finished"];
// // TournamentSchema.virtual("currentStage").get(function () {
// //   const stageId = this.getCurrentStageId();
// //   return this.stages[stageId];
// // });

// TournamentSchema.method("getCurrentStageId", function() {
//   if (this.end) return this.stages.length; //FIXME: potential error

//   for (let i=0; i<this.stages.length; i++) {
//     const {start, end} = stage[i];
//     const now = new Date();

//     if (end && now <= end) {
//       return i;
//     }
//   }
// })

TournamentSchema.virtual("start").get(function () {
  return this._id.getTimestamp();
});

TournamentSchema.virtual("location").get(function () {
  const locations = ["indoors", "outdoors", "hybrid"]
  return locations[this.locationId];
})

TournamentSchema.virtual("isRegistrationOver").get(function () {
  return this.registration.to && new Date() > this.registration.to;
})

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
