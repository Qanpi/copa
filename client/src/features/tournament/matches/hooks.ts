import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Dayjs } from "dayjs";
import _ from "lodash";
import { useTournament } from "../../..";
import { useParticipants } from "../../participant/hooks";
import { Match } from "@backend/models/match";

export const useUpdateMatch = () => {
  return useMutation({
    mutationFn: async (values: Partial<Match>) => {
      const res = await axios.patch(`/api/matches/${values.id}`, values);
      return res.data;
    },
  });
};

export const useMatchScheduler = () => {
  const { data: tournament } = useTournament("current");
  const { data: participants } = useParticipants();
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
