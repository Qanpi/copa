import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import mongoose, { SchemaTypes } from "mongoose";
import { collections } from "../configs/db.config.js";
import { romanize } from "../services/helpers.js";

dayjs.extend(relativeTime);

//TODO: split into user and admin models
const TournamentSchema = new mongoose.Schema(
  {
    idx: Number,
    organizer: {
      name: String,
      phoneNumber: String,
    },
    divisions: {
      type: [SchemaTypes.ObjectId],
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    virtuals: {
      states: {
        get() {
          return this.schema.path("state").enumValues;
        },
      },
      name: {
        get() {
          return `Copa ${romanize(this.idx)}`;
        },
      },
    },
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

TournamentSchema.virtual("start").get(function () {
  return this._id.getTimestamp();
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

const Tournament = mongoose.model("Tournament", TournamentSchema);

export default Tournament;
