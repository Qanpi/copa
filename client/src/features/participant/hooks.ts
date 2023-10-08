import {
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import { ObjectId } from "mongodb";
import { TParticipant } from "@backend/models/participant";
import { divisionKeys } from "../tournament/hooks";

export const participantKeys = {
  all: "participants",
  id: (id?: ObjectId) => [participantKeys.all, id?.toString()],
  query: (query: Partial<TParticipant>) => [participantKeys.all, query],
};

export const useParticipant = (id?: ObjectId) => {
  return useQuery({
    queryKey: [participantKeys.id(id)],
    queryFn: async () => {
      const url = `/api/${participantKeys.all}/${id}`;
      const res = await axios.get(url);
      return res.data as TParticipant;
    },
    enabled: !!id,
  });
};

export const useParticipants = (divisionId: string, query?: Partial<TParticipant>) => {
  return useQuery({
    queryKey: [participantKeys.query(query)],

    queryFn: async () => {
      let url = `/api/${divisionKeys.all}/${divisionId}/${participantKeys.all}`;

      if (query) {
        url += "?";
        Object.entries(query).forEach(([k, v]) => (url += `${k}=${v}`));
      }

      const res = await axios.get(url);
      return res.data as TParticipant[];
    },

    enabled: Boolean(divisionId)
  });
};
