import {
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import { ObjectId } from "mongodb";
import { TParticipant } from "@backend/models/participant";
import { divisionKeys, tournamentKeys, useTournament } from "../viewer/hooks";
import { queryKeyFactory } from "../types";

export const participantKeys = queryKeyFactory<TParticipant>("participants");

export const useParticipant = (participantId: string) => {
  const { data: tournament } = useTournament("current");

  return useQuery({
    queryKey: [participantKeys.id(participantId)],
    queryFn: async () => {
      const url = `/api/${tournamentKeys.all}/${tournament.id}/participants/${participantId}`;
      const res = await axios.get(url);
      return res.data as TParticipant;
    },
    enabled: !!participantId,
  });
};

export const useParticipants = (tournamentId?: string, query?: Partial<TParticipant>): UseQueryResult<TParticipant[]> => {
  return useQuery({
    queryKey: participantKeys.list(query),

    queryFn: async (): Promise<TParticipant[]> => {
      let url = `/api/${tournamentKeys.all}/${tournamentId}/${participantKeys.all}`;

      if (query) {
        url += "?";
        Object.entries(query).forEach(([k, v]) => (url += `${k}=${v}`));
      }

      const res = await axios.get(url);
      return res.data as TParticipant[];
    },

    enabled: Boolean(tournamentId) && (query ? Object.values(query).every(v => v) : true)
  });
};

export const useUpdateParticipant = () => {
  const {data: tournament} = useTournament("current");

  return useMutation({
    mutationFn: async (values: Partial<TParticipant>) => {
      const res = await axios.put(`/api/tournaments/${tournament?.id}/participants/${values.id}`, values);
      return res.data;
    },
  });
}
