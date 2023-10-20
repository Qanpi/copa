import request from "supertest"
import app from "../app.js"
import { ObjectId } from "mongodb"
import { shuffle } from "lodash-es"

const admin = request.agent(app)
const auth = request.agent(app)

let tournamentId: string;
let divisionId: string;

const nParticipants = 11;
const groupCount = 4;

describe("Group stage", function () {
    beforeAll(async () => {
        await admin.post("/login/tests")
            .send({ username: "admin", password: "admin" });
        await auth.post("/login/tests")
            .send({ username: "user", password: "admin" });
    })

    beforeEach(async () => {
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

    it("should get all registered participants", async () => {
        const {body: participants} = await auth.get(`/api/tournaments/${tournamentId}/participants`);

        expect(participants).toHaveLength(nParticipants);
    })

    it("should create group stage from draw", async () => {
        const {body: participants} = await auth.get(`/api/tournaments/${tournamentId}/participants`);
        const shuffled = shuffle(participants) //simulate the drawing wheel

        await admin.post(`/api/tournaments/${tournamentId}/stages`)
        .send({
            name: "group stage",
            type: "round_robin",
            tournamentId: divisionId,
            settings: {
                groupCount,
            },
            shuffled
        })

        await auth.get(`/api`)
    })

    it.todo("should prevent duplicate group stage", async () => {
        const {body: participants} = await auth.get(`/api/tournaments/${tournamentId}/participants`);
        const shuffled = shuffle(participants) //simulate the drawing wheel

        await admin.post(`/api/tournaments/${tournamentId}/stages`)
        .send({
            name: "group stage",
            type: "round_robin",
            tournamentId: divisionId,
            settings: {
                groupCount,
            },
            shuffled
        })

        const res = await admin.post(`/api/tournaments/${tournamentId}/stages`)
        .send({
            name: "group stage 2",
            type: "round_robin",
            tournamentId: divisionId,
            settings: {
                groupCount,
            },
            shuffled
        })

        expect(res.status).toEqual(500);
    })

    it("should reset group stage for a division", async () => {
        const {body: participants} = await auth.get(`/api/tournaments/${tournamentId}/participants`);
        const shuffled = shuffle(participants) //simulate the drawing wheel

        const res = await admin.post(`/api/tournaments/${tournamentId}/stages`)
        .send({
            name: "group stage 2",
            type: "round_robin",
            tournamentId: divisionId,
            settings: {
                groupCount,
            },
            shuffled
        })
        
        expe
    })

    it.todo("should block because of undrawn teams")

    it.todo("should block because of incomplete matches")
})