import app from "../app.js";
import request from "supertest";

const admin = request.agent(app)
const user = request.agent(app);

describe("Bracket/play-offs", () => {
    it.todo("todo")
})