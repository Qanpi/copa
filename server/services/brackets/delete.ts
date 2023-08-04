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

export async function handleDelete<T extends keyof DataTypes>(
  table: T,
  filter?: Partial<DataTypes[T]>
): Promise<boolean> {
  const tournament = await Tournament.findCurrent();
  switch (table) {
    case "participant":
      if (!filter) {
        return Participant.deleteMany({})
          .then(() => true)
          .catch(() => false);
      }

      return Participant.deleteMany({
        ...Participant.translateAliases(filter),
        _id: filter.id,
        id: undefined,
      })
        .then(() => true)
        .catch(() => false);
    case "group":
      if (!filter) {
        tournament!.set({ groups: undefined });
      } else {
        const filtered = _filter(
          tournament!.groups.toObject(),
          !_matches(Tournament.translateSubAliases("group", filter))
        );
        tournament?.set({ groups: filtered });
      }

      return tournament!
        .save()
        .then(() => true)
        .catch(() => false);
    case "stage":
      if (!filter) {
        tournament!.set({ stages: undefined });
      } else {
        const filtered = _filter(
          tournament!.stages.toObject(),
          !_matches(Tournament.translateSubAliases("stage", filter))
        );
        tournament?.set({ stages: filtered });
      }

      return tournament!
        .save()
        .then(() => true)
        .catch(() => false);
    case "round":
      if (!filter) {
        tournament!.set({ rounds: undefined });
      } else {
        const filtered = _filter(
          tournament!.rounds.toObject(),
          !_matches(Tournament.translateSubAliases("round", filter))
        );
        tournament?.set({ rounds: filtered });
      }

      return tournament!
        .save()
        .then(() => true)
        .catch(() => false);
    case "match":
      if (!filter) {
        return Match.deleteMany({})
          .then(() => true)
          .catch(() => false);
      }
      return Match.deleteMany({
        ...Match.translateAliases(filter),
        _id: filter.id,
        id: undefined,
      })
        .then(() => true)
        .catch(() => false);
    case "match_game":
      if (!filter) {
        return Match.updateMany({}, { $set: { games: undefined } })
          .exec()
          .then(() => true)
          .catch(() => false);
      }

      return Match.updateMany(
        {},
        { $set: { "games.$[elem]": undefined } },
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
