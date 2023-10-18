import request from "supertest"
import app from "../app.js"

describe("Teams management logic", () => {
    beforeAll(async () => {

    })

  it("should create a new team with manager", async () => {
    const res = await request(app).get("/api/tournaments");
    console.log(res.body)
    expect(res.body).toContainEqual({id: 1})
  })  
})