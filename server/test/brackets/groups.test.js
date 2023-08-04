import Tournament from "../../models/tournament";
import { MongooseForBrackets } from "../../services/brackets";
import { connectMongoose, disconnectMongoose } from "../../services/mongo";
import { ObjectId } from "mongodb";
import {
  expect,
  describe,
  beforeAll,
  test,
  afterAll,
  afterEach,
} from "@jest/globals";

const createGroup = async (mock) => {
  const tournament = await Tournament.findCurrent();

  const group = tournament.groups.create(mock);
  tournament.groups.push(group);
  return tournament.save().then(() => group);
};

describe("Brackets CRUD for groups for MongoDB via Azure Cosmos", () => {
  let crud;

  const mock = {
    number: 1,
    stage_id: new ObjectId().toString(),
  };

  beforeAll(() => {
    crud = new MongooseForBrackets();
    return connectMongoose();
  });

  test("insert one", async () => {
    const id = await crud.insert("group", mock);
    expect(id).not.toBe(-1);

    const tournament = await Tournament.findCurrent();
    const test = tournament.groups.id(id);
    expect(test.number).toEqual(mock.number);
  });

  test("select one", async () => {
    const group = await createGroup(mock);

    const test = await crud.select("group", group.id);
    expect(test.number).toEqual(mock.number);
  });

  test("update one", async () => {
    const group = await createGroup(mock);

    const update = {
      stage_id: new ObjectId(),
    };

    const bool = await crud.update("group", group.id, update);
    expect(bool).toBe(true);

    const tournament = await Tournament.findCurrent();
    const updated = tournament.groups.id(group.id);
    expect(updated.stage_id.toString()).toEqual(update.stage_id.toString());
  });

  test("delete", async () => {
    const group = await createGroup(mock);

    const deleteData = {
      stage_id: group.stage_id,
    };

    const bool = await crud.delete("group", deleteData);
    expect(bool).toBe(true);

    const t = await Tournament.findCurrent();
    expect(t.groups.id(group.id)).toBe(null);
  });

  const stageId = new ObjectId();
  const mocks = [
    {
      name: "Tinpot 1",
      stage_id: stageId.toString(),
    },
    {
      name: "Tinpot 2",
      stage_id: stageId.toString(),
    },
  ];

  test("insert arr", async () => {
    const bool = await crud.insert("group", mocks);
    expect(bool).toBe(true);

    const tournament = await Tournament.findCurrent();
    expect(tournament.groups).toEqual(
      expect.arrayContaining(
        mocks.map((m) => expect.objectContaining({ name: m.name }))
      )
    );
  });

  test("select arr", async () => {
    for (const m of mocks) {
      await createGroup(m);
    }

    const select = {
      stage_id: stageId.toString(),
    };
    const test = await crud.select("group", select);
    expect(test).toHaveLength(mocks.length);
  });

  test("update arr", async () => {
    for (const m of mocks) {
      await createGroup(m);
    }

    const filter = {
      stage_id: stageId.toString(),
    };

    const newId = new ObjectId();
    const update = {
      stage_id: newId.toString(),
    };

    const bool = await crud.update("group", filter, update);
    expect(bool).toBe(true);

    const tournament = await Tournament.findCurrent();
    const test = tournament.groups.filter(
      (g) => g.stage.toString() == newId.toString()
    );
    expect(test).toHaveLength(mocks.length);
  });

  test("delete all", async () => {
    for (const m of mocks) {
      await createGroup(m);
    }

    const bool = await crud.delete("group");
    expect(bool).toBe(true);

    const t = await Tournament.findCurrent();
    expect(t.groups).toHaveLength(0);
  });

  afterEach(async () => {
    const tournament = await Tournament.findCurrent();
    tournament.set({ groups: undefined });
    return await tournament.save();
  });

  afterAll(async () => {
    return await disconnectMongoose();
  });
});
