import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TMatch } from "brackets-mongo-db";
import { tournamentKeys } from "../tournament/hooks";

export const useGroups = (
  tournamentId: string,
  query?: Partial<TMatch> & { scheduled?: boolean }
) => {
  return useQuery({
    queryKey: ["groups", query],
    queryFn: async () => {
      let url = `/api/${tournamentKeys.all[0]}/${tournamentId}/groups`;

      if (query) {
        url += "?";
        for (const [k, v] of Object.entries(query)) {
          url += `${k}=${v}&`; //FIXME: appends & at the end
        }
      }

      const res = await axios.get(url);
      return res.data;
    },
    enabled: Boolean(tournamentId)
  });
};