import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ObjectId } from "mongodb";
import {Participant} from "@backend/models/participant"

export const participantKeys = {
  all: "participants",
  id: (id: ObjectId) => [participantKeys.all, id.toString()],
  query: (query: Partial<Participant>) => [participantKeys.all, query],
};

export const useParticipant = (id: ObjectId) => {
  return useQuery({
    queryKey: [participantKeys.id(id)],
    queryFn: async () => {
      const url = `/api/${participantKeys.all}/${id}`;
      const res = await axios.get(url);
      return res.data as Participant;
    }
  })
}

export const useParticipants = (query?: Partial<Participant>) => {
  return useQuery({
    queryKey: [participantKeys.query(query)],

    queryFn: async () => {
      let url = `/api/${participantKeys.all}`;

      if (query) {
        url += "?";
        Object.entries(query).forEach(([k, v]) => (url += `${k}=${v}`));
      }

      const res = await axios.get(url);
      return res.data as Participant[];
    },
  });
};
