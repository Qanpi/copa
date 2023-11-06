import app from "../app.js";
import request from "supertest";
import { disconnectMongoose } from "../services/mongo.js";
import e from "express";
import { TDivision } from "../models/division.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const admin = request.agent(app);
const auth = request.agent(app);
const viewer = request.agent(app);

let mongod: MongoMemoryServer;

describe("Kickstart tournament", () => {
    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();

        await mongoose
            .connect(mongod.getUri(), {
                ignoreUndefined: true,
            })

        await admin.post("/login/tests")
            .send({ username: "admin", password: "admin" });

        await auth.post("/login/tests")
            .send({ username: "user", password: "user" });

        await viewer.post("/login/tests")
            .send({ username: "user", password: "user" });
    })

    it("should reject a tournament with no divisons", async () => {
        const res = await admin.post("/api/tournaments");
        expect(res.status).toEqual(500);
    })

    it("should create and retrieve a tournament with one division", async () => {
        const res = await admin.post("/api/tournaments").send({
            divisions: ["Div 1"]
        })

        expect(res.status).toEqual(201);

        const { body: tournament } = await admin.get("/api/tournaments/latest");
        expect(tournament.divisions.map((d: TDivision) => d.name)).toEqual(["Div 1"]);
    })

    it("should create a tournament with up to ten divisions", async () => {
        const n = Math.ceil(Math.random() * 10);
        const divisions = Array.from({ length: n }, (_, i) => `Div ${i + 1}`);

        const res = await admin.post("/api/tournaments").send({
            divisions
        })

        expect(res.status).toEqual(201);

        const { body: tournament } = await admin.get("/api/tournaments/latest");
        expect(tournament.divisions.map((d: TDivision) => d.name)).toEqual(divisions);
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

    it("should reject user trying to create a tournament", async () => {
        const res = await auth.post("/api/tournaments").send({
            divisions: ["Div 1", "Div 2"]
        })

        expect(res.status).toEqual(403);
    })

    it("should reject viewer trying to create a tournament", async () => {
        const res = await viewer.post("/api/tournaments").send({
            divisions: ["Div 1", "Div 2"]
        })

        expect(res.status).toEqual(403);
    })

    afterEach(async () => {
        await admin.delete("/");
    })

    afterAll(async () => {
        await mongoose.disconnect();
        await mongod.stop();
    })
})