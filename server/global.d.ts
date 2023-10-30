import { MongoMemoryServer } from "mongodb-memory-server";

export { };

declare global {
    namespace Express {
        interface User {
            id?: string,
            name?: string,
            team?: string,
            role?: string
        }
    }

    module globalThis {
        var __MONGOD__: MongoMemoryServer;
    }
}