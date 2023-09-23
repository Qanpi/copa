import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const tournamentKeys = {
  all: ["tournaments"],
  details: () => [...tournamentKeys.all, "detail"],
  detail: (id: string) => [...tournamentKeys.details(), id],
};

export const useTournament = (id: string) => {
  return useQuery({
    queryKey: tournamentKeys.detail(id),
    queryFn: async () => {
      const response = await axios.get(`/api/${tournamentKeys.all}/${id}`);
      return response.data;
    },
  });
};



