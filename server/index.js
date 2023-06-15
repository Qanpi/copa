import path from "path";
import https from "https";
import { fileURLToPath } from "url";
import express from "express";

//azure cosmos db
import { DefaultAzureCredential } from "@azure/identity";
import { CosmosClient  } from "@azure/cosmos";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const app = express();

const cosmosEndpoint = "https://localhost:8081";
const databaseName = "databaseName";
const containerName = "containerName";

console.log(process.env.COSMOS_ENDPOINT)
const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY,
    agent: new https.Agent({
        rejectUnauthorized: false
    })
})

app.use(express.static(path.resolve(__dirname, "../client/build")));

app.get("/api", (req, res) => {
    res.json({message: "Hello from server!"});
})
 
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
})

/**
 * Create the database if it does not exist
 */
const databaseId = "SampleDB";
async function createDatabase() {
  const { database } = await cosmosClient.databases.createIfNotExists({
    id: databaseId
  })
  console.log(`Created database:\n${database.id}\n`)
}

/**
 * Read the database definition
 */
async function readDatabase() {
  const { resource: databaseDefinition } = await cosmosClient
    .database(databaseId)
    .read()
  console.log(`Reading database:\n${databaseDefinition.id}\n`)
}

createDatabase()
    .then(() => readDatabase())

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});