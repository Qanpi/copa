import { TMatch } from "@backend/models/match";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Dayjs } from "dayjs";
import _ from "lodash";
import { useParticipants } from "../participant/hooks";
import { tournamentKeys, useTournament } from "../viewer/hooks";
import { QueryKeyFactory, queryKeyFactory } from "../types";

const matchKeys = queryKeyFactory("matches");

export const useUpdateMatch = () => {
  //TODO: think abt this: currently only works with current tournament
  const { data: tournament } = useTournament("current");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Partial<TMatch>) => {
      const res = await axios.patch(`/api/${tournamentKeys.all[0]}/${tournament.id}/matches/${values.id}`, values);
      return res.data;
    },
    onSuccess(data) {
      queryClient.setQueriesData(matchKeys.id(data.id), data);
      queryClient.invalidateQueries(matchKeys.lists)
    },
  });
};

export const useMatchScheduler = () => {
  const { data: tournament } = useTournament("current");
  const { data: participants } = useParticipants(tournament?.id);
  const updateMatch = useUpdateMatch();

  return (start: Dayjs, adminBlocked: Dayjs[], matches: any[]) => {
    const byRound = _.groupBy(matches, (m) => {
      const round = tournament?.rounds.find((r: any) => r.id === m.round);
      return round.number;
    });
    const matchesByRound = Object.values(byRound);

    let day = start.subtract(1, "day");
    let round = 0;

    while (round < matchesByRound.length) {
      day = day.add(1, "day");

      if (day.day() === 0 || day.day() === 6) continue;
      if (adminBlocked.some((b) => b.isSame(day, "day"))) continue;

      //check if it's blocked by teams
      for (const m of matchesByRound[round]) {
        const opponents = participants.filter(
          (p: any) => p.id === m.opponent1.id || p.id === m.opponent2.id
        );

        let blocked = false;
        opponents.forEach((o: any) => {
          if (o.blocked?.some((b: any) => b.isSame(day, "day"))) {
            blocked = true;
          }
        });

        if (blocked) {
          matchesByRound[round + 1] =
            round + 1 < matchesByRound.length ? matchesByRound[round + 1] : [];
          matchesByRound[round + 1].unshift(m);
          continue;
        }

        updateMatch.mutate({ ...m, start: day.toDate() });
      }

      round++;
    }
  };
};

export const useMatch = (id: string) => {
  const {data: tournament} = useTournament("current");

  return useQuery({
    queryKey: matchKeys.id(id),
    queryFn: async () => {
      const url = `/api/tournaments/${tournament?.id}/${matchKeys.all}/${id}`;
      const res = await axios.get(url);
      return res.data as TMatch;
    },
  });
};

export const useMatches = (
  tournamentId: string,
  query?: Partial<TMatch> & { scheduled?: boolean }
) => {
  return useQuery({
    queryKey: matchKeys.list(query),
    queryFn: async () => {
      let url = `/api/${tournamentKeys.all[0]}/${tournamentId}/matches`;

      if (query) {
        url += "?";
        for (const [k, v] of Object.entries(query)) {
          url += `${k}=${v}&`; //FIXME: appends & at the end
        }
      }

      const res = await axios.get(url);
      return res.data as TMatch[];
    },
    enabled: Boolean(tournamentId) && (query ? Object.values(query).every(v => v) : true)
  });
};
