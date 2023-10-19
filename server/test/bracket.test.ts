import app from "../app.js";
import request from "supertest";
import { disconnectMongoose } from "../services/mongo.js";

const admin = request.agent(app)
const user = request.agent(app);

describe("Bracket/play-offs", () => {
    beforeAll(async () => {
        await admin.post("/login/tests")
            .send({ username: "admin", password: "admin" });
    })

    afterEach(async () => {
        await admin.delete("/");
    })

    afterAll(async () => {
        await disconnectMongoose();
    })
})