import mongoose from "mongoose"
import "dotenv/config"
import _debugger from "debug"
const debug = _debugger("mongodb:")

await mongoose
  .connect(process.env["MONGODB_CONNECTION_STRING"])
  .then(() => debug("Connection to CosmosDB succesful."))
  .catch(console.error);