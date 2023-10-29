import request from "supertest"
import app from "../app.js"
import { ObjectId } from "mongodb"
import { shuffle } from "lodash-es"
import { Stage } from "brackets-model"

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
        const { body: participants } = await auth.get(`/api/tournaments/${tournamentId}/participants`);

        expect(participants).toHaveLength(nParticipants);
    })

    describe("Creating group stage", () => {
        let stage: Stage;

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
                    shuffled
                })

            stage = res.body;
        })

        it("should create group stage from draw", async () => {
            const { body: stages } = await auth.get(`/api/tournaments/${tournamentId}/stages`);
            expect(stages.length).toEqual(1);
        })

        it("should prevent duplicate group stage", async () => {
            const { body: participants } = await auth.get(`/api/tournaments/${tournamentId}/participants`);
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

            expect(res.status).toEqual(500);
        })

        it("should reset group stage for a division", async () => {
            const res = await admin.delete(`/api/tournaments/${tournamentId}/stages/${stage.id}`);
            expect(res.status).toEqual(204);

            const { body: check } = await admin.get(`/api/tournaments/${tournamentId}/stages`);
            expect(check.length).toEqual(0);
        })

        it("should block moving to bracket because of undrawn teams", async () => {
            await admin.patch(`/api/tournaments/${tournamentId}`).send({

            });
        })
    })


    it.todo("should block moving to bracket because of incomplete matches")

    it.todo("should forfeit all matches if team is unregistered")

    it.todo("should forfeit all matches if team is deleted")
})