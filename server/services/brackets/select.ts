import { DataTypes } from "brackets-manager";
import { OmitId } from "brackets-manager";
import { Id } from "brackets-model";
import Tournament, { GroupSchema } from "../../models/tournament";
import Participant from "../../models/participant";
import Match from "../../models/match";
import {
  matches as _matches,
  filter as _filter,
  isMatch as _isMatch,
  remove as _remove,
} from "lodash-es";

export async function handleSelect<T extends keyof DataTypes>(
  table: T,
  filter?: Partial<DataTypes[T]> | Id
): Promise<DataTypes[T][] | DataTypes[T] | null> {
  if (typeof filter === "number")
    throw TypeError("Number id's are not in use.");

  const tournament: any = await Tournament.findCurrent();

  switch (table) {
    case "participant":
      if (filter === undefined) {
        return Participant.find({}).exec() as unknown as Promise<
          DataTypes[T][]
        >;
      } else if (typeof filter === "string") {
        return Participant.findById(filter).exec() as unknown as Promise<
          DataTypes[T]
        >;
      }

      return await Participant.find(
        Participant.translateAliases(filter)
      ).exec() as unknown as Promise<DataTypes[T][]>;

    case "stage":
      if (filter === undefined) {
        return tournament?.stages as unknown as Promise<DataTypes[T][]>;
      } else if (typeof filter === "string") {
        return tournament?.stages.id(filter) as unknown as Promise<
          DataTypes[T]
        >;
      }

      return _filter(
        tournament?.stages.toObject(),
        Tournament.translateSubAliases("stage", filter)
      ) as unknown as DataTypes[T][];

    case "group":
      if (filter === undefined) {
        return tournament?.groups as unknown as Promise<DataTypes[T][]>;
      } else if (typeof filter === "string") {
        return tournament?.groups.id(filter) as unknown as Promise<
          DataTypes[T]
        >;
      }

      return _filter(
        tournament?.groups.toObject(),
        Tournament.translateSubAliases("group", filter)
      ) as unknown as DataTypes[T][];

    case "round":
      if (filter === undefined) {
        return tournament?.rounds as unknown as Promise<DataTypes[T][]>;
      } else if (typeof filter === "string") {
        return tournament?.rounds.id(filter) as unknown as Promise<
          DataTypes[T]
        >;
      }

      return _filter(
        tournament?.rounds.toObject(),
        Tournament.translateSubAliases("round", filter)
      ) as unknown as DataTypes[T][];

    case "match":
      if (filter === undefined) {
        return Match.find({}).exec() as unknown as Promise<DataTypes[T][]>;
      } else if (typeof filter === "string") {
        return Match.findById(filter).exec() as unknown as Promise<
          DataTypes[T]
        >;
      }

      return Match.find(
        Match.translateAliases(filter)
      ).exec() as unknown as Promise<DataTypes[T][]>;
    case "match_game":
      if (typeof filter === "string") {
        const match = await Match.findOne({ "games.id": filter });
        return match?.games.id(filter) as unknown as Promise<DataTypes[T]>;
      }

      return Match.aggregate([
        {
          $unwind: "$games",
        },
        {
          $replaceRoot: {
            newRoot: "$games",
          },
        },
        {
          $match: filter ? filter : {},
        },
      ]).exec() as unknown as Promise<DataTypes[T][]>;

    default:
      return null;
  }
}
