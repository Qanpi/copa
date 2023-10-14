import { BracketsManager } from "brackets-manager";
import MongooseForBrackets from "brackets-mongo-db";
import Match from "../models/match.js";
import MatchGame from "../models/matchGame.js";
import Participant from "../models/participant.js";
import Stage from "../models/stage.ts";
import Round from "../models/round.ts";
import Group from "../models/group.ts";

const storage = new MongooseForBrackets(
  Participant,
  Match,
  MatchGame,
  Round,
  Stage,
  Group
);

export const bracketsManager = new BracketsManager(storage, true);
