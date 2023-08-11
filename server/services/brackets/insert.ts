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

export async function handleInsert<T extends keyof DataTypes>(
  table: T,
  data: OmitId<DataTypes[T]> | OmitId<DataTypes[T]>[]
): Promise<Id | boolean> {
  let tournament = await Tournament.findCurrent(); 
  if (!tournament) tournament = await new Tournament().save();

  switch (table) {
    case "participant":
      const participantData = data as
        | OmitId<DataTypes["stage"]>
        | OmitId<DataTypes["stage"]>[];

      if (Array.isArray(participantData)) {
        return Participant.insertMany(participantData)
          .then(() => true)
          .catch(err => {console.error(err); return false});
      } else {
        return Participant.create(participantData)
          .then((result) => result.id)
          .catch(err => {console.error(err); return -1});
      }

    case "stage":
      const stageData = data as
        | OmitId<DataTypes["stage"]>
        | OmitId<DataTypes["stage"]>[];

      if (Array.isArray(stageData)) {
        tournament.stages.push(...stageData);

        return await tournament
          .save()
          .then(() => true)
          .catch(err => {console.error(err); return false});
      } else {
        const stage = tournament.stages.create(data);
        tournament.stages.push(stage);

        return tournament
          .save()
          .then(() => stage.id)
          .catch(err => {console.error(err); return -1});
      }

    case "group":
      const groupData = data as
        | OmitId<DataTypes["group"]>
        | OmitId<DataTypes["group"]>[];
      if (Array.isArray(groupData)) {
        tournament.groups.push(...groupData);
        return tournament
          .save()
          .then(() => true)
          .catch(err => {console.error(err); return false});
      } else {
        const group = tournament.groups.create(groupData);
        tournament.groups.push(group);

        return tournament
          .save()
          .then(() => group.id)
          .catch(err => {console.error(err); return -1});
      }

    case "round":
      const roundData = data as
        | OmitId<DataTypes["round"]>
        | OmitId<DataTypes["round"]>[];
      if (Array.isArray(roundData)) {
        tournament.rounds.push(...roundData);
        return tournament
          .save()
          .then(() => true)
          .catch(err => {console.error(err); return false});
      } else {
        const round = tournament.rounds.create(roundData);
        tournament.rounds.push(round);
        return tournament
          .save()
          .then(() => round.id)
          .catch(err => {console.error(err); return -1});
      }

    case "match":
      const matchData = data as
        | OmitId<DataTypes["match"]>
        | OmitId<DataTypes["match"]>[];

      if (Array.isArray(matchData)) {
        return Match.insertMany(matchData)
          .then(() => true)
          .catch(err => {console.error(err); return false});
      } else {
        return Match.create(matchData)
          .then((result) => result.id)
          .catch(err => {console.error(err); return -1});
      }

    case "match_game":
      const matchGameData = data as
        | OmitId<DataTypes["match_game"]>
        | OmitId<DataTypes["match_game"]>[];

      if (Array.isArray(matchGameData)) {
        const promises = [];

        for (const matchGame of matchGameData) {
          //TODO: could potentially sort and batch this but maybe overkill
          //or just aggregate somehow
          const match = await Match.findById(matchGame.parent_id);
          match?.games.push(matchGame);

          promises.push(match?.save());
        }

        return Promise.all(promises)
          .then(() => true)
          .catch(err => {console.error(err); return false});
      } else {
        const match = await Match.findById(matchGameData.parent_id);

        const matchGame = match!.games.create(matchGameData);
        match!.games.push(matchGame);
        return match!
          .save()
          .then(() => matchGame.id)
          .catch(err => {console.error(err); return -1});
      }

    default:
      return false;
  }
}
