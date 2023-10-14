import { Group } from "brackets-mongo-db";
import mongoose from "mongoose";

export default Group.discriminator("Group",
    new mongoose.Schema({
    }, {
        _id: true,
        virtuals: {
            name: {
                get(this: any) {
                    const alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase();

                    return `Group ${alphabet[this.number - 1]}`;
                },
            },
        },
    })
);

//TODO:
// CustomGroupSchema.virtual("participants", {
//   ref: collections.participants.id,
//   localField: "_id",
//   foreignField: "group",
// });