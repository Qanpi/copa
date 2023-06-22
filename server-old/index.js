import path from "path";
import https from "https";
import { fileURLToPath } from "url";
import express from "express";
import "dotenv/config";
import config from "../server/config.js";

//azure cosmos db
import { DefaultAzureCredential } from "@azure/identity";
import { CosmosClient } from "@azure/cosmos";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const app = express();

const cosmosEndpoint = "https://localhost:8081";

const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
  agent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

app.use(express.static(path.resolve(__dirname, "../client/build")));

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

const databaseId = config.database.id;

//Create the database if it doesn't exist
async function createDatabase() {
  const { database } = await cosmosClient.databases.createIfNotExists({
    id: databaseId,
  });

  console.log(`Created database:\n${database.id}\n`);
}

//Create a container if it doesn't exist
async function createContainer(blueprint) {
  const { container } = await cosmosClient
    .database(databaseId)
    .containers.createIfNotExists(blueprint);

  console.log(`Created container:\n${container.id}\n`);
}

//Create "player" item if it doesn't exist
async function createPlayerItem(blueprint) {
  const { item } = await cosmosClient
    .database(databaseId)
    .container("players")
    .items.upsert(blueprint); // replace upsert later on

  console.log(`Created player item with id: ${item.id}`);
}

createDatabase()
  .then(() => {
    for (let c of config.containers) {
      createContainer(c);
    }
  })
  .then(() => createPlayerItem(config.player));

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
