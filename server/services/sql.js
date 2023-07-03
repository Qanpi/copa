import "dotenv/config"
import { CosmosClient } from "@azure/cosmos";
import https from "https"
import config from "../configs/db.config.js"

import _debugger from "debug";
const debug = _debugger("db:")

class SQLDatabaseService  {
    constructor (cosmosClient, databaseId, containers) {
        this.client = cosmosClient;
        this.id = databaseId;

        this.init();

        for (const key in containers) {
            this.createContainer(containers[key]);
        }
    }

    async init() {
        const { database } = await this.client.databases.createIfNotExists({
            id: this.id,
        });

        debug(`Created database:\n${database.id}\n`);
    }

    async createContainer(cBlueprint) {
        const { container } = await this.client.database(this.id)
            .containers.createIfNotExists(cBlueprint);

        debug(`Created container:\n${container.id}\n`);
    }

    async query(containerId, querySpec) {
        const {resources} = await this.client.database(this.id)
            .container(containerId)
            .items.query(querySpec)
            .fetchAll();
        
        return resources;
    }

}

const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
  agent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

const sqlDatabase = new SQLDatabaseService(
  cosmosClient,
  config.database.id,
  config.containers
);

export default sqlDatabase;

