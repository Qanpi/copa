import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
} from "@jest/globals";
import { ObjectId } from "mongodb";
import Participant from "../../models/participant";
import { MongooseForBrackets } from "../../services/brackets";
import { connectMongoose, disconnectMongoose } from "../../services/mongo";

describe("Brackets CRUD for participants for MongoDB via Azure Cosmos", () => {
  let crud;

  const mock = {
    name: "Name",
    tournament_id: new ObjectId().toString(),
  };

  beforeAll(async () => {
    crud = new MongooseForBrackets();
    return await connectMongoose();
  });

  test("insert one", async () => {
    const id = await crud.insert("participant", mock);
    expect(id).not.toBe(-1);

    const test = await Participant.findById(id).exec();
    expect(test.name).toEqual(mock.name);
  });

  test("select one", async () => {
    const og = await new Participant(mock).save();

    const test = await crud.select("participant", og.id);
    expect(test.name).toEqual(og.name);
  });

  test("update one", async () => {
    const og = await new Participant(mock).save();

    const newId = new ObjectId().toString();

    const bool = await crud.update("participant", og.id, {
      tournament_id: newId  
    });
    expect(bool).toBe(true);

    const test = await Participant.findById(og.id);
    expect(test.tournament.toString()).toEqual(newId);
  });

  test("delete one", async () => {
    const og = await new Participant(mock).save();

    const deleteData = {
      name: og.name,
      tournament_id: og.tournament?.toString(),
    };

    const bool = await crud.delete("participant", deleteData);
    expect(bool).toBe(true);

    const test = await Participant.findById(og.id);
    expect(test).toBe(null);
  });

  const tournamentId = new ObjectId();
  const mocks = [
    {
      name: "Tinpot 1",
      tournament_id: tournamentId.toString(),
    },
    {
      name: "Tinpot 2",
      tournament_id: tournamentId.toString(),
    },
  ];

  test("insert arr", async () => {
    const bool = await crud.insert("participant", mocks);
    expect(bool).toBe(true);

    const filter = {
      tournament: tournamentId.toString(),
    };

    const test = await Participant.find(filter).exec();
    expect(test).toEqual(
      expect.arrayContaining(
        mocks.map((m) => expect.objectContaining({ tournament: new ObjectId(m.tournament_id) }))
      )
    );
  });

  test("select arr", async () => {
    await Participant.insertMany(mocks);

    const select = {
      tournament_id: tournamentId.toString()
    }

    const test = await crud.select("participant", select);
    expect(test).toHaveLength(mocks.length);
  })


  test("update arr", async ( ) => {
    await Participant.insertMany(mocks);

    const filter = {
      tournament_id: tournamentId.toString(),
    }

    const newId = new ObjectId().toString();
    const update = {
      tournament_id: newId,
    }

    const bool = await crud.update("participant", filter, update);
    expect(bool).toBe(true);

    const test = await Participant.find({tournament: newId});
    expect(test).toHaveLength(mocks.length);
  })

  test("delete arr", async () => {
    await Participant.insertMany(mocks);

    const filter = {
      tournament_id: tournamentId.toString(),
    }
    const bool = await crud.delete("participant", filter);
    expect(bool).toBe(true);

    const test = await Participant.find(Participant.translateAliases(filter));
    expect(test).toHaveLength(0);
  })

  afterEach(async () => {
    return await Participant.collection.drop();
  });

  afterAll(async () => {
    return await disconnectMongoose();
  });
});
