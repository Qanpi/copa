import "dotenv/config"
import _debugger from "debug"

const debug = _debugger("model:")

class DatabaseModel  {
    constructor (cosmosClient, databaseId, containers) {
        this.client = cosmosClient;
        this.id = databaseId;

        this.init();
        containers.forEach(c => {
            this.createContainer(c);
        });
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

export default DatabaseModel;

