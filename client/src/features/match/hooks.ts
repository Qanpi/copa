import { TMatch } from "@backend/models/match";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Dayjs } from "dayjs";
import _ from "lodash";
import { useParticipants } from "../participant/hooks";
import { tournamentKeys, useTournament } from "../tournament/hooks";
import { QueryKeyFactory, queryKeyFactory } from "../types";
import { useDebouncedCallback } from "use-debounce";

const matchKeys = queryKeyFactory("matches");

export const useUpdateMatch = ({ debounce=true }: { debounce?: boolean }={}) => {
  //TODO: think abt this: currently only works with current tournament
  const { data: tournament } = useTournament("current");
  const queryClient = useQueryClient();

  const updateMatch = useDebouncedCallback(
    async (values: Partial<TMatch>) => {
      const res = await axios.patch(`/api/${tournamentKeys.all[0]}/${tournament.id}/matches/${values.id}`, values);
      return res;
    },
    (debounce ? 200 : 0)
  )

  const invalidate = useDebouncedCallback(
    (data: Partial<TMatch>) => {
      queryClient.invalidateQueries(matchKeys.lists)
      queryClient.invalidateQueries(matchKeys.id(data.id));
    },
    (debounce ? 500 : 0)
  )

  return useMutation({
    mutationFn: async (values: Partial<TMatch>) => {
      const res = await updateMatch(values);
      return res?.data as TMatch;
    },
    onSettled(data, error, variables) {
      invalidate(variables);
    },
    async onMutate(data) {
      await queryClient.cancelQueries(matchKeys.all); //to not overwrite optimistic update
      queryClient.setQueriesData(matchKeys.id(data.id), old => ({ ...old, ...data }));

      queryClient.setQueriesData(matchKeys.list({ scheduled: "true" }), (old) => {
        return old?.map(m => m.id === data.id ? { ...m, ...data } : m);
      })
    }
  });
};



export const useMatch = (id?: string) => {
  const { data: tournament } = useTournament("current");

  return useQuery({
    queryKey: matchKeys.id(id),
    queryFn: async () => {
      const url = `/api/tournaments/${tournament?.id}/${matchKeys.all}/${id}`;
      const res = await axios.get(url);
      return res.data as TMatch;
    },
    enabled: !!id
  });
};

export const useMatches = (
  tournamentId?: string,
  query?: Partial<TMatch> & { scheduled?: string }
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
