import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TMatch } from "brackets-mongo-db";
import { tournamentKeys, useTournament } from "../viewer/hooks";
import { useStageData } from "./GroupStage";

export const useStages = (
  tournamentId: string,
  query?: Partial<TMatch> & { scheduled?: boolean }
) => {
  return useQuery({
    queryKey: ["stages", query],
    queryFn: async () => {
      let url = `/api/${tournamentKeys.all[0]}/${tournamentId}/stages`;

      if (query) {
        url += "?";
        for (const [k, v] of Object.entries(query)) {
          url += `${k}=${v}&`; //FIXME: appends & at the end
        }
      }

      const res = await axios.get(url);
      return res.data;
    },
    enabled: Boolean(tournamentId) && (query ? Object.values(query).every(v => v) : true)
  });
};

export const useGroupStageData = (divisionId: string) => {
    const { data: tournament } = useTournament("current");

    const { data: stages } = useStages(tournament?.id, {
        division: divisionId,
        type: "round_robin"
    });
    const groupStage = stages?.[0];

    return useStageData(groupStage?.id);
}