import { Round } from "brackets-mongo-db";
import mongoose from "mongoose";

export default Round.discriminator("Round",
    new mongoose.Schema({
    }, {
        _id: true
    })
);