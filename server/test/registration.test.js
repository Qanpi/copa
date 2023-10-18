import request from "supertest";
import app from "../app.js";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";
import { disconnectMongoose } from "../services/mongo.js";

const admin = request.agent(app);
const auth = request.agent(app);
const viewer = request.agent(app);

let teamId;
let tournamentId;
let divisionIds;

describe("Registration stage", () => {
  beforeAll(async () => {
    await admin
      .post("/login/tests")
      .send({ username: "admin", password: "admin" });

    await auth.post("/login/tests").send({
      username: "user",
      password: "user",
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
    divisionIds = tournament.divisions.map((d) => d.id);

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

  it.todo("should reject registration if not manager");

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

  it("should reject duplicate registration by team", async () => {
    const res = await auth
      .post(`/api/tournaments/${tournamentId}/participants`)
      .send({
        team: teamId,
        division: divisionIds[2],
      });
    expect(res.status).toEqual(201);

    await auth.post(`/api/tournaments/${tournamentId}/participants`).send({
      team: teamId,
      divisionIds: divisionIds[0],
    });

    expect(res.status).toEqual(500);
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

  afterEach(async () => {
    await admin.delete("/");
  });

  afterAll(async () => {
    await disconnectMongoose();
  });
});
