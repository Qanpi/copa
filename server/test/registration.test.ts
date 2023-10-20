import request from "supertest";
import app from "../app.js";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";
import { disconnectMongoose } from "../services/mongo.js";
import { TDivision } from "../models/division.js";

const admin = request.agent(app);
const auth = request.agent(app);
const auth2 = request.agent(app);
const viewer = request.agent(app);

let teamId: string;
let tournamentId: string;
let divisionIds: string[];

describe("Registration stage", () => {
  beforeAll(async () => {
    await admin
      .post("/login/tests")
      .send({ username: "admin", password: "admin" });

    await auth.post("/login/tests").send({
      username: "user",
      password: "user",
    });

    await auth2.post("/login/tests").send({
      username: "user2",
      password: "user2",
    });
  });

  beforeEach(async () => {
    const { body: tournament } = await admin.post("/api/tournaments").send({
      divisions: ["Div 1", "Div 2", "Div 3"], //length must be at least 3
    });

    await admin.patch(`/api/tournaments/${tournament.id}`).send({
      "registration.from": dayjs().subtract(1, "day").toDate(),
      "registration.to": dayjs().add(1, "day").toDate(),
    });

    tournamentId = tournament.id;
    divisionIds = tournament.divisions.map((d: TDivision) => d.id);

    const { body: manager } = await auth.get("/me");
    const resTeam = await auth.post("/api/teams").send({
      name: "Tinpot",
      manager: manager.id,
    });

    await auth.get("/me"); //necessary to update req.user object
    //TODO: perhaps do this in deserialization
    //but that's too many requests

    teamId = resTeam.body.id;
  });

  it("should reject registration if not manager", async () => {
    //manually insert member
    const { body: member } = await auth2.get("/me");
    const { body: updated } = await admin.post(`/api/teams/${teamId}/users`)
      .send({ user: member.id });

    expect(updated.team.id).toEqual(teamId);

    const res = await auth2
      .post(`/api/tournaments/${tournamentId}/participants`)
      .send({
        team: teamId,
        division: divisionIds[1],
      });

    expect(res.status).toEqual(403);
  });

  it("should register participant", async () => {
    const res = await auth
      .post(`/api/tournaments/${tournamentId}/participants`)
      .send({
        team: teamId,
        division: divisionIds[1],
      });

    expect(res.status).toEqual(201);
    expect(res.body).toHaveProperty("id");
  });

  it("should find registered participant based on team and tournament", async () => {
    const { body: og } = await auth
      .post(`/api/tournaments/${tournamentId}/participants`)
      .send({
        team: teamId,
        division: divisionIds[1],
      });

    const res = await auth
      .get(`/api/tournaments/${tournamentId}/participants`)
      .query({
        team: teamId,
        division: divisionIds[1],
      });

    expect(res.body[0].id).toEqual(og.id);
  });

  it("should unregister participant", async () => {
    const { body: og } = await auth
      .post(`/api/tournaments/${tournamentId}/participants`)
      .send({
        team: teamId,
        division: divisionIds[1],
      });

    const res = await auth.delete(
      `/api/tournaments/${tournamentId}/participants/${og.id}`
    );
    expect(res.status).toEqual(204);

    const check = await auth
      .get(`/api/tournaments/${tournamentId}/participants`)
      .query({
        team: teamId,
        division: divisionIds[1],
      });

    expect(check.body).toHaveLength(0);
  });

  it("should reject member's attempt to unregister", async () => {
    const { body: member } = await auth2.get('/me');
    await admin.post(`/api/teams/${teamId}/users`)
      .send({
        user: member.id
      })

    const { body: og } = await auth
      .post(`/api/tournaments/${tournamentId}/participants`)
      .send({
        team: teamId,
        division: divisionIds[0],
      });

    await auth2.get("/me");
    const res = await auth2.delete(
      `/api/tournaments/${tournamentId}/participants/${og.id}`
    );

    expect(res.status).toEqual(403);
  })

  it("should reject duplicate registration by team", async () => {
    const res = await auth
      .post(`/api/tournaments/${tournamentId}/participants`)
      .send({
        team: teamId,
        division: divisionIds[2],
      });
    expect(res.status).toEqual(201);

    const res2 = await auth
      .post(`/api/tournaments/${tournamentId}/participants`)
      .send({
        team: teamId,
        divisionIds: divisionIds[0],
      });

    expect(res2.status).toEqual(500);
  });

  it("should reject registration with invalid team", async () => {
    const madeUpId = new ObjectId();

    const res = await auth
      .post(`/api/tournaments/${tournamentId}/participants`)
      .send({
        teamId: madeUpId,
        division: divisionIds[0],
      });

    expect(res.status).toEqual(500);
  });

  it("should reject registration to invalid division", async () => {
    const madeUpId = new ObjectId();

    const res = await auth
      .post(`/api/tournaments/${tournamentId}/participants`)
      .send({
        team: teamId,
        division: madeUpId,
      });

    expect(res.status).toEqual(500);
  });

  it("should reject early registration", async () => {
    await admin.patch(`/api/tournaments/${tournamentId}`).send({
      "registration.from": dayjs().add(1, "minute").toDate(),
    });

    const res = await auth
      .post(`/api/tournaments/${tournamentId}/participants`)
      .send({
        team: teamId,
        division: divisionIds[1],
      });

    expect(res.status).toEqual(500);
  });

  it("should reject late registration", async () => {
    await admin.patch(`/api/tournaments/${tournamentId}`).send({
      "registration.to": dayjs().subtract(1, "minute").toDate(),
    });

    const res = await auth
      .post(`/api/tournaments/${tournamentId}/participants`)
      .send({
        team: teamId,
        division: divisionIds[0],
      });

    expect(res.status).toEqual(500);
  });

  it("should reject registration if no deadline", async () => {
    await admin.patch(`/api/tournaments/${tournamentId}`).send({
      "registration": {}
    });

    const res = await auth
      .post(`/api/tournaments/${tournamentId}/participants`)
      .send({
        team: teamId,
        division: divisionIds[0],
      });

    expect(res.status).toEqual(500);
  })

  it("should allow admin to bypass registration deadlines", async () => {
    await admin.patch(`/api/tournaments/${tournamentId}`).send({
      "registration.to": dayjs().subtract(1, "minute").toDate(),
    });

    const res = await admin
      .post(`/api/tournaments/${tournamentId}/participants`)
      .send({
        team: teamId,
        division: divisionIds[0],
      });

    expect(res.status).toEqual(201);
  })

  afterEach(async () => {
    await admin.delete("/");
  });

  afterAll(async () => {
    await disconnectMongoose();
  });
});
