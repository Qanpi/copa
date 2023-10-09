import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import axios from "axios";
import { Id, QueryKeyFactory } from "../types";
import { RoundNameInfo } from "ts-brackets-viewer";

export const tournamentKeys = {
  all: ["tournaments"],
  id: (id: Id) => [tournamentKeys.all, id],
  query: () => [...tournamentKeys.all, "detail"],
};

export const useTournament = (id: string) => {
  return useQuery({
    queryKey: tournamentKeys.id(id),
    queryFn: async () => {
      const response = await axios.get(`/api/${tournamentKeys.all}/${id}`);
      return response.data;
    },
    enabled: Boolean(id)
  });
};

export const useUpdateTournament = (id: Id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values) => {
      const res = await axios.patch(`/api/tournaments/${id}`, values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(tournamentKeys.id(id));
    },
  });
};

export const divisionKeys = {
  all: "divisions",
  id: (id: Id) => [divisionKeys.all, id],
  query: () => [divisionKeys.all, "detail"],
};

export const useDivision = (id: string) => {
  const { data: tournament } = useTournament("current");

  return useQuery({
    queryKey: divisionKeys.id(id),
    queryFn: async () => {
      const response = await axios.get(`/api/${tournamentKeys.all}/${tournament.id}/${divisionKeys.all}/${id}`);
      return response.data;
    },
  });
}

export const useDivisions = (tournamentId: string) => {
  const { data: tournament } = useTournament(tournamentId);

  return {
    data: tournament?.divisions
  }
}

export const finalRoundNames = (roundInfo: RoundNameInfo) => {
  if ("fractionOfFinal" in roundInfo) {
    switch (roundInfo.fractionOfFinal) {
      case 1:
        return "Finals";
      case 0.5:
        return "Semifinals";
      case 0.25:
        return "Quarterfinals";
      default:
        return `Round of ${Math.round(1 / roundInfo.fractionOfFinal) * 2}`;
    }
  }

  return `Round ${roundInfo.roundNumber}`;
};

