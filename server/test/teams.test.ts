import request from "supertest";
import app from "../app.js";
import { disconnectMongoose } from "../services/mongo.js";

const admin = request.agent(app);
const auth = request.agent(app);
const viewer = request.agent(app);

describe("Teams management logic", function () {
  beforeAll(async function () {
    await admin.post("/login/tests")
      .send({ username: "admin", password: "admin" });

    await auth.post("/login/tests")
      .send({ username: "user", password: "user" });
  })

  it("should reject team with no manager", async function () {
    const res = await auth.post("/api/teams").send({name: "Tinpot"});
    expect(res.status).toEqual(500);
  })

  it("should create team and assign manager", async function () {
    const user = await auth.get("/me");

    const team = await auth.post("/api/teams").send({name: "Tinpot", manager: user.body.id});

    expect(team.body.name).toEqual("Tinpot");
    expect(team.body.manager).toEqual(user.body.id);
  })

  it("should create team and assign it to user", async function () {
    let user = await auth.get("/me");
    const team = await auth.post("/api/teams").send({name: "Tinpot", manager: user.body.id});

    user = await auth.get("/me");
    expect(user.body.team.name).toEqual(team.body.name)
    expect(user.body.team.id).toStrictEqual(team.body.id);
  })

  it.todo("should only accept a valid name")

  it.todo("should not allow identical names")

  it("should remove member from team", async function () {
    let {body: user} = await auth.get("/me");
    const {body: team} = await auth.post("/api/teams").send({name: "Tinpot", manager: user.id});

    const res = await auth.delete(`/api/teams/${team.id}/users/${user.id}`);
    expect(res.status).toEqual(204);

    const {body: updated} = await auth.get("/me");
    expect(updated.team).toBe(undefined);
  })

  it.todo("should pass manager title to another member")

  it.todo("should reject removing a different member")

  it.todo("should allow admin to remove a different member")



  beforeEach(async function () {
    return await admin.delete("/");
  })

  afterAll(async function () {
    return await disconnectMongoose();
  })
})