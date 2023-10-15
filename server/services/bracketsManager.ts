import { BracketsManager } from "brackets-manager";
import MongooseForBrackets from "brackets-mongo-db";
import Match from "../models/match.js";
import MatchGame from "../models/matchGame.js";
import Participant from "../models/participant.js";
import Stage from "../models/stage.js";
import Round from "../models/round.js";
import Group from "../models/group.js";

const storage = new MongooseForBrackets(
  Participant,
  Match,
  MatchGame,
  Round,
  Stage,
  Group
);

export const bracketsManager = new BracketsManager(storage, true);
