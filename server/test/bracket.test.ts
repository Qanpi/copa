import app from "../app.js";
import request from "supertest";
import { disconnectMongoose } from "../services/mongo.js";

const admin = request.agent(app)
const user = request.agent(app);

describe("Bracket/play-offs", () => {
    it.todo("todo")
})