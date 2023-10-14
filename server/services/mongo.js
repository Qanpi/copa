import mongoose from "mongoose";
import "dotenv/config";
import _debugger from "debug";
const debug = _debugger("mongodb:");

export const connectMongoose = async () => {
  return await mongoose
    .connect(process.env["MONGODB_CONNECTION_STRING"], {
      ignoreUndefined: true
    })
    .then(() => debug("Connection to CosmosDB succesful."))
    .catch(console.error);
};

export const disconnectMongoose = async () => {
  return await mongoose.disconnect();
}