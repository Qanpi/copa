import request from "supertest"
import app from "../app.js"
import { ObjectId } from "mongodb"
import { shuffle } from "lodash-es"
import { InputStage, Stage } from "brackets-model"
import { TTournament } from "../models/tournament.js"
import { disconnectMongoose } from "../services/mongo.js"
import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"

const admin = request.agent(app)
const auth = request.agent(app)

let tournamentId: string;
let divisionId: string;
let stageId: string;

const nParticipants = 11;
const groupCount = 4;

describe("Group stage", function () {
    beforeAll(async () => {
        const mongod = await MongoMemoryServer.create();

        await mongoose
            .connect(mongod.getUri(), {
                ignoreUndefined: true,
            })

        await admin.post("/login/tests")
            .send({ username: "admin", password: "admin" });
        await auth.post("/login/tests")
            .send({ username: "user", password: "admin" });

        const { body: tournament } = await admin.post("/api/tournaments").send({
            divisions: ["Div 1"],
        });
        tournamentId = tournament.id;
        divisionId = tournament.divisions[0].id;

        const teams = Array.from({ length: nParticipants }).map((_, i) => `Team ${i + 1}`);

        for (const t of teams) {
            const { body: team } = await admin.post(`/api/teams`)
                .send({ manager: new ObjectId(), name: t })

            await admin.post(`/api/tournaments/${tournament.id}/participants`)
                .send({
                    team: team.id,
                    division: divisionId
                })
        }
    })

    beforeEach(async () => {
        const { body: participants } = await auth.get(`/api/tournaments/${tournamentId}/participants`);
        const shuffled = shuffle(participants) //simulate the drawing wheel

        const res = await admin.post(`/api/tournaments/${tournamentId}/stages`)
            .send({
                name: "group stage",
                type: "round_robin",
                tournamentId: divisionId,
                settings: {
                    groupCount,
                },
                seeding: shuffled
            })

        stageId = res.body.id;
    }, 50000)

    it("should get all registered participants", async () => {
        const { body: participants } = await auth.get(`/api/tournaments/${tournamentId}/participants`);

        expect(participants).toHaveLength(nParticipants);
    })

    it("should create group stage from draw", async () => {
        const { body: stages } = await auth.get(`/api/tournaments/${tournamentId}/stages`);
        expect(stages.length).toEqual(1);
    })

    //TODO: as of now, multiple group stages are allowed and it's on the client side to prevent them...
    it.skip("should prevent duplicate group stage _with the same name_", async () => {
        const { body: participants } = await auth.get(`/api/tournaments/${tournamentId}/participants`);
        const shuffled = shuffle(participants) //simulate the drawing wheel

        const res = await admin.post(`/api/tournaments/${tournamentId}/stages`)
            .send({
                name: "group stage",
                type: "round_robin",
                tournamentId: divisionId,
                settings: {
                    groupCount,
                },
                seeding: shuffled
            })

        expect(res.status).toEqual(500);
    })

    it("should reset group stage for a division", async () => {
        const res = await admin.delete(`/api/tournaments/${tournamentId}/stages/${stageId}`);
        expect(res.status).toEqual(204);

        const { body: check } = await admin.get(`/api/tournaments/${tournamentId}/stages`);
        expect(check.length).toEqual(0);
    })

    it("should block moving to bracket because of incomplete matches", async () => {
        const res = await admin.patch(`/api/tournaments/${tournamentId}`).send({
            state: "Bracket"
        } as Partial<TTournament>);

        expect(res.status).toEqual(400);
    })

    it("should move to bracket", async () => {
        const { body: matches } = await admin.get(`/api/tournaments/${tournamentId}/matches`).query({
            stageIds: [stageId]
        })

        for (const m of matches) {
            await admin.patch(`/api/tournaments/${tournamentId}/matches/${m.id}`).send({
                opponent1: {
                    score: 1,
                    result: "win"
                }
            })
        }

        const res = await admin.patch(`/api/tournaments/${tournamentId}`).send({
            state: "Bracket"
        } as Partial<TTournament>);

        expect(res.status).toEqual(200);
    })

    //maybe not block this? in case necessary to skip group stage
    it.skip("should block moving to bracket because of no group stage", async () => {
        const res = await admin.patch(`/api/tournaments/${tournamentId}`).send({
            state: "Bracket"
        } as Partial<TTournament>);

        expect(res.status).toEqual(500);
    })

    afterEach(async () => {
        await admin.delete(`/api/tournaments/${tournamentId}/divisions/${divisionId}`);
    })

    afterAll(async () => {
        await admin.delete("/");
        await mongoose.disconnect();
    })
})