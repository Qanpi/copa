import request from "supertest";
import app from "../app.js";
import { disconnectMongoose } from "../services/mongo.js";
import { ObjectId } from "mongodb";

const admin = request.agent(app);
const auth = request.agent(app);
const auth2 = request.agent(app);
const auth3 = request.agent(app);
const viewer = request.agent(app);

describe("Teams management logic", function () {
  beforeEach(async function () {
    await admin.post("/login/tests")
      .send({ username: "admin", password: "admin" });

    await auth.post("/login/tests")
      .send({ username: "user", password: "user" });

    await auth2.post(`/login/tests`)
      .send({ username: "user2", password: "user2" })

    const user3 = await auth3.post(`/login/tests`)
      .send({ username: "user3", password: "user3" })
  })

  it("should reject team with no manager", async function () {
    const res = await auth.post("/api/teams").send({ name: "Tinpot" });
    expect(res.status).toEqual(500);
  })

  it("should reject team with no name", async function () {
    const { body: manager } = await auth.get("/me");

    const res = await auth.post("/api/teams")
      .send({ manager: manager.id });

    expect(res.status).toEqual(500);
  })

  it("should create team and assign manager", async function () {
    const user = await auth.get("/me");
    const team = await auth.post("/api/teams").send({ name: "Tinpot", manager: user.body.id });

    expect(team.body.name).toEqual("Tinpot");
    expect(team.body.manager).toEqual(user.body.id);
  })

  it("should create team and assign it to user", async function () {
    let user = await auth.get("/me");
    const team = await auth.post("/api/teams").send({ name: "Tinpot", manager: user.body.id });

    user = await auth.get("/me");
    expect(user.body.team.name).toEqual(team.body.name)
    expect(user.body.team.id).toStrictEqual(team.body.id);
  })

  it("should encode reserved uri characters in team name", async function () {
    //important because it is used on the front-end in urls

    const { body: user } = await auth.get("/me");
    const name = "   T! * ' ( ) ; : @ & = + $ , / ? % # [ ]!@ $% #^ &@)~)}{ }~   ";
    const { body: team } = await auth.post("/api/teams").send({ name, manager: user.id });

    const { body: check1 } = await auth.get(`/api/teams?name=${name}`);
    expect(check1).toHaveLength(0);

    const { body: check2 } = await auth.get(`/api/teams?name=${encodeURIComponent(name.trim())}`);
    expect(check2).toHaveLength(1);
  })


  it("should not allow identical names", async function () {
    const team1 = await admin.post("/api/teams").send({ name: "Tinpot", manager: new ObjectId() })
    expect(team1.status).toEqual(201);

    const team2 = await admin.post("/api/teams").send({ name: "Tinpot", manager: new ObjectId() })
    expect(team2.status).toEqual(500);
  })

  it("should not allow two teams with the same manager", async function () {
    const managerId = new ObjectId();

    const team1 = await admin.post("/api/teams").send({ name: "Tinpot 1", manager: managerId })
    expect(team1.status).toEqual(201);

    const team2 = await admin.post("/api/teams").send({ name: "Tinpot 2", manager: managerId })
    expect(team2.status).toEqual(500);
  })

  it("should remove manager from team", async function () {
    let { body: user } = await auth.get("/me");
    const { body: team } = await auth.post("/api/teams").send({ name: "Tinpot", manager: user.id });

    await auth.get("/me");
    const res = await auth.delete(`/api/teams/${team.id}/users/${user.id}`);
    expect(res.status).toEqual(204);

    const { body: updated } = await auth.get("/me");
    expect(updated.team).toBe(undefined);

    const { body: updatedTeam } = await auth.get(`/api/teams/${team.id}`);
    expect(updatedTeam.manager).toBe(undefined)
  })

  it("should reject if user already in a team", async function () {
    let { body: user } = await auth.get("/me");

    const res = await auth.post("/api/teams").send({ name: "Tinpot", manager: user.id });
    expect(res.status).toEqual(201);

    await auth.get("/me");
    const res2 = await auth.post("/api/teams").send({ name: "Tinpot 2", manager: user.id });
    expect(res2.status).toEqual(403);
  })

  describe("Invite link", function () {
    let teamId: string;
    let invite: { token: string, expiresAt: Date };

    beforeEach(async () => {
      let { body: user } = await auth.get("/me");
      const { body: team } = await auth.post("/api/teams").send({ name: "Tinpot", manager: user.id });
      teamId = team.id;

      const res = await auth.get(`/api/teams/${teamId}/invite`);
      invite = res.body;
    })

    it("should reject invite link request for non-member", async function () {
      const res = await auth3.get(`/api/teams/${teamId}/invite`);

      expect(res.status).toEqual(403);
    })

    it("should generate valid invite link", async function () {
      expect(invite.token).toBeDefined();
      expect(new Date(invite.expiresAt) >= new Date()).toBe(true);
    })

    it("should claim invite link and join team, but not disturb it", async function () {
      const res = await auth2.post(`/api/teams/${teamId}/join`)
        .send({ token: invite.token });
      expect(res.status).toEqual(201);

      const { body: updated } = await auth2.get(`/me`);
      expect(updated.team.id).toEqual(teamId)

      //verify it didn't disturb anything
      const { body: manager } = await auth.get(`/me`);
      expect(manager.team.id).toEqual(teamId);

      const { body: team } = await auth.get(`/api/teams/${teamId}`);
      expect(team.manager).toEqual(manager.id);
    })

    it("should reject invite link with a mismatching team id", async function () {
      //3rd user to ensure that 2nd has not team
      //i.e. the sole cause for not being able to join is wrong id

      const { body: user3 } = await auth3.get(`/me`);
      const { body: fakeTeam } = await auth3.post(`/api/teams`)
        .send({ name: "Tinpot fake", manager: user3.id })

      const res = await auth2.post(`/api/teams/${fakeTeam.id}/join`)
        .send({ token: invite.token });

      expect(res.status).toEqual(403);
    })

    it("should reject invite link if user already in a team", async function () {
      const { body: user2 } = await auth2.get(`/me`);
      const { body: team } = await auth2.post(`/api/teams`)
        .send({ name: "Tinpot 2", manager: user2.id })

      await auth2.get(`/me`);

      const res = await auth2.post(`/api/teams/${teamId}/join`)
        .send({ token: invite.token });

      expect(res.status).toEqual(403);
    })

    it("should reject invite link with invalid token", async function () {
      const res = await auth2.post(`/api/teams/${teamId}/join`)
        .send({ token: invite.token + 'a' });

      expect(res.status).toEqual(403);
    })

    it("should invalidate token after refresh", async function () {
      const res = await auth2.post(`/api/teams/${teamId}/join`)
        .send({ token: invite.token });

      expect(res.status).toEqual(201);

      const { body: newToken } = await auth.get(`/api/teams/${teamId}/invite`);

      const res2 = await auth3.post(`/api/teams/${teamId}/join`)
        .send({ token: invite.token });

      expect(res2.status).toEqual(403);
    })

    it("should invalidate token after a day", async function () {
      const res = await auth2.post(`/api/teams/${teamId}/join`)
        .send({ token: invite.token });

      expect(res.status).toEqual(201);

      await admin.patch(`/api/teams/${teamId}`)
        .send({ "invite.expiresAt": new Date() });

      const res2 = await auth3.post(`/api/teams/${teamId}/join`)
        .send({ token: invite.token });

      expect(res2.status).toEqual(403);
    })

    it("should reject invite link for member", async function () {
      const res = await auth2.get(`/api/teams/${teamId}/invite`);

      expect(res.status).toEqual(403);
    })
  })

  it("should allow admin to manually add member", async function () {
    let { body: manager } = await auth.get("/me");
    const { body: team } = await auth.post("/api/teams").send({ name: "Tinpot", manager: manager.id });

    //TODO: manually add member to team
    const { body: member } = await auth2.get("/me");
    await admin.post(`/api/teams/${team.id}/users`).send(
      {
        user: member.id
      }
    )

    const { body: updated } = await auth2.get("/me");
    expect(updated.team.id).toEqual(team.id);

    const { body: members } = await admin.get(`/api/teams/${team.id}/users`);
    expect(members).toHaveLength(2);
  })

  it.skip("should pass manager title to another member upon leaving", async function () {
    let { body: manager } = await auth.get("/me");
    const { body: team } = await auth.post("/api/teams").send({ name: "Tinpot", manager: manager.id });

    //TODO: manually add member to team
    const { body: member } = await auth2.get("/me");
    await admin.post(`/api/teams/${team.id}/players`).send(
      {
        user: member.id
      }
    )

    const res = await auth.delete(`/api/teams/${team.id}/users/${manager.id}`);
    expect(res.status).toEqual(204);

    const { body: exManager } = await auth.get("/me");
    expect(exManager.team).toBe(undefined);

    const { body: updatedTeam } = await auth.get(`/api/teams/${team.id}`);
    expect(updatedTeam.manager).toEqual(member.id);
  })


  it("should not allow a different manager", async () => {
    const { body: other } = await auth2.get("/me");

    const res = await auth.post("/api/teams").send({ name: "Tinpot", manager: other.id });
    expect(res.status).toEqual(403);
  })

  it("should reject removing a different member", async () => {
    const { body: manager } = await auth.get("/me");
    const { body: team } = await auth.post("/api/teams").send({ name: "Tinpot", manager: manager.id });

    const res = await auth2.delete(`/api/teams/${team.id}/users/${manager.id}`);
    expect(res.status).toEqual(403);
  })

  it("should allow admin to remove member", async () => {
    const { body: manager } = await auth.get("/me");
    const { body: team } = await auth.post("/api/teams").send({ name: "Tinpot", manager: manager.id });

    const res = await admin.delete(`/api/teams/${team.id}/users/${manager.id}`);
    expect(res.status).toEqual(204);
  })

  afterEach(async function () {
    return await admin.delete("/");
  })

  afterAll(async function () {
    return await disconnectMongoose();
  })
})