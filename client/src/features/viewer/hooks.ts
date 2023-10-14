import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import axios from "axios";
import { Id, QueryKeyFactory, queryKeyFactory } from "../types";
import { RoundNameInfo } from "ts-brackets-viewer";
import { TTournament } from "@backend/models/tournament";

export const tournamentKeys = queryKeyFactory("tournaments");

export const useTournament = (id: string) => {
  return useQuery({
    queryKey: tournamentKeys.id(id),
    queryFn: async () => {
      const response = await axios.get(`/api/${tournamentKeys.all}/${id}`);
      return response.data as TTournament;
    },
    enabled: Boolean(id)
  });
};

export const useCreateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: Partial<TTournament>) => {
      const res = await axios.post(`/api/tournaments/`, body);
      return res.data as TTournament;
    },
    onSuccess: (tournament) => {
      queryClient.setQueriesData(tournamentKeys.id("current"), tournament);
      queryClient.setQueriesData(tournamentKeys.id(tournament.id), tournament);
    },
  });
}

export const useUpdateTournament = (id: Id) => {
  const { data: current } = useTournament("current");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Partial<TTournament>) => {
      const res = await axios.patch(`/api/tournaments/${id}`, values);
      return res.data as TTournament;
    },
    onSuccess: (tournament) => {
      if (current.id === tournament.id) queryClient.setQueriesData(tournamentKeys.id("current"), tournament);
      queryClient.setQueriesData(tournamentKeys.id(id), tournament);
      //TODO: lists update
    },
  });
};

export const divisionKeys = queryKeyFactory("divisions");

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

