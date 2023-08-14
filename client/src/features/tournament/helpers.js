import { useTournament } from "../..";





//FIXME: refactor the above out of this file -> it's not used multiple times

export function getRoundFromTournament(tournament, id) {
  return tournament.rounds?.find(r => r.id === id);
}

export function getStageFromTournament(tournament, id) {
  return tournament.stages?.find(r => r.id === id);
}

export function getGroupFromTournament(tournament, id) {
  return tournament.groups?.find(r => r.id === id);
}

export function useRound(id) {
  const tournament = useTournament("current");

  return getRoundFromTournament(tournament, id);
}

