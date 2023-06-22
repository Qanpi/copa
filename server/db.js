import config from "./config.js"
import { CosmosClient } from "@azure/cosmos";
import https from "https"
import "dotenv/config"

const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
  agent: new https.Agent({
    rejectUnauthorized: false,
  }),
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

// //Create "player" item if it doesn't exist
// async function createPlayerItem(blueprint) {
//   const { item } = await cosmosClient
//     .database(databaseId)
//     .container("players")
//     .items.upsert(blueprint); // replace upsert later on

//   console.log(`Created player item with id: ${item.id}`);
// }

export async function queryDatabase(containerId, querySpec) {
    const {resources} = await cosmosClient
        .database(databaseId)
        .container(containerId)
        .items.query(querySpec)
        .fetchAll();
    
    return resources;
}

export function initializeDatabase() {
    createDatabase()
        .then(() => {
            for (let c of config.containers) {
                createContainer(c);
            }
        })
}