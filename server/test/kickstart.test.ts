import app from "../app.js";
import request from "supertest";
import { disconnectMongoose } from "../services/mongo.js";

const admin = request.agent(app)
const user = request.agent(app);

describe("Kickstart tournament", () => {
    beforeAll(async () => {
        await admin.post("/login/tests")
            .send({ username: "admin", password: "admin" });
    })

    it("should reject a tournament with no divisons", async () => {
        const res = await admin.post("/api/tournaments")
        expect(res.status).toEqual(500);
    })

    it("should create and retrieve a tournament with one division", async () => {
        const res = await admin.post("/api/tournaments").send({
            divisions: ["Div 1"]
        })

        expect(res.status).toEqual(201);

        const {body: tournament} = await admin.get("/api/tournaments/latest");
        expect(tournament.divisions.map(d => d.name)).toEqual(["Div 1"]);
    })

    it("should create a tournament with multiple divisions", async () => {
        const res = await admin.post("/api/tournaments").send({
            divisions: ["Div 1", "Div 2"]
        })

        expect(res.status).toEqual(201);

        const {body: tournament} = await admin.get("/api/tournaments/latest");
        expect(tournament.divisions.map(d => d.name)).toEqual(["Div 1", "Div 2"]);
    })

    it("should reject creating a duplicate tournament", async () => {
        await admin.post("/api/tournaments").send({
            divisions: ["Div 1", "Div 2"]
        })

        const res = await admin.post("/api/tournaments").send({
            divisions: ["Div 3", "Div 4"]
        })

        expect(res.status).toBe(500);   
    })

    afterEach(async () => {
        await admin.delete("/");
    })

    afterAll(async () => {
        await disconnectMongoose();
    })
})