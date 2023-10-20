import mongoose from "mongoose";
import { debugDB } from "./debuggers.js";

export const connectMongoose = async () => {
  return await mongoose
    .connect(process.env.MONGODB_CONNECTION_STRING!, {
      ignoreUndefined: true,
    })
    .then(() => debugDB("Connected to Azure CosmosDB instance."))
    .catch((err) => debugDB(err));
};

export const disconnectMongoose = async () => {
  debugDB("Disconnecting from Azure CosmosDB instance...");
  return await mongoose.disconnect();
};
