import { DataTypes } from "brackets-manager";
import { OmitId } from "brackets-manager";
import { Id } from "brackets-model";
import Tournament from "../../models/tournament";
import Participant from "../../models/participant";
import Match from "../../models/match";
import {
  matches as _matches,
  filter as _filter,
  isMatch as _isMatch,
  remove as _remove,
} from "lodash-es";

export async function handleUpdate<T extends keyof DataTypes>(
  table: T,
  filter: Partial<DataTypes[T]> | Id,
  data: Partial<DataTypes[T]> | DataTypes[T]
): Promise<boolean> {
  if (typeof filter === "number") throw TypeError("IDs can't be numbers.");
  const tournament = await Tournament.findCurrent();

  switch (table) {
    case "participant":
      const d = Participant.translateAliases(data);

      if (typeof filter === "string") {
        return Participant.findByIdAndUpdate(filter, d)
          .exec()
          .then(() => true)
          .catch(() => false);
      }

      const f = Participant.translateAliases(filter);
      return Participant.updateMany(f, d)
        .exec()
        .then(() => true)
        .catch(() => false);
    case "stage":
      const stage = tournament!.stages.id(filter);
      stage?.set(data);

      return tournament!
        .save()
        .then(() => true)
        .catch(() => false);
    case "group":
      if (typeof filter === "string") {
        const group = tournament!.groups.id(filter);
        group?.set(data);
      } else {
        tournament!.groups.forEach((g) => {
          if (_isMatch(g, Tournament.translateSubAliases("group", filter))) {
            g.set(Tournament.translateSubAliases("group", data));
          }
        });
      }

      return tournament!
        .save()
        .then(() => true)
        .catch(() => false);
    case "round":
      if (typeof filter === "number") {
        throw TypeError("IDs can't be numbers.");
      }

      if (typeof filter === "string") {
        const round = tournament!.rounds.id(filter);
        round?.set(data);
      } else {
        tournament!.rounds.forEach((r) => {
          if (_isMatch(r, Tournament.translateSubAliases("round", filter))) {
            r.set(Tournament.translateSubAliases("round", data));
          }
        });
      }

      return tournament!
        .save()
        .then(() => true)
        .catch(() => false);
    case "match":
      if (typeof filter === "string") {
        return Match.findByIdAndUpdate(filter, Match.translateAliases(data))
          .exec()
          .then(() => true)
          .catch(() => false);
      }

      return Match.updateMany(
        Match.translateAliases(filter),
        Match.translateAliases(data)
      )
        .exec()
        .then(() => true)
        .catch(() => false);
    case "match_game":
      if (typeof filter === "string") {
        const match = await Match.findOne({ "games.id": filter }); //FIXME: probablay a one-lienr way to do this
        const matchGame = match?.games.id(filter);
        matchGame?.set(data);

        return match!
          .save()
          .then(() => true)
          .catch(() => false);
      }

      //FIXME: doesn't rly work for stage or round id's cuz virtuals
      return Match.updateMany(
        {},
        {
          $set: {
            "games.$[elem]": data,
          },
        },
        {
          arrayFilters: [
            {
              elem: {
                filter,
              },
            },
          ],
        }
      )
        .exec()
        .then(() => true)
        .catch(() => false);

    default:
      return false;
  }
}
