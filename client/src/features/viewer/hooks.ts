import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Id, QueryKeyFactory, queryKeyFactory } from "../types";
import { RoundNameInfo } from "ts-brackets-viewer";
import { TTournament } from "@backend/models/tournament";
import { TDivision } from "@backend/models/division";

export const tournamentKeys = queryKeyFactory<TTournament>("tournaments");

export const useTournament = (id?: string) => {
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

  return useMutation<TTournament, AxiosError, Partial<TTournament>>({
    mutationFn: async (body: Partial<TTournament> & {divisions: string[]}) => {
      const res = await axios.post(`/api/tournaments/`, body);
      return res.data as TTournament;
    },
    onSuccess: (tournament) => {
      queryClient.setQueriesData(tournamentKeys.id("current"), tournament);
      queryClient.invalidateQueries(tournamentKeys.lists);
    },
    // onMutate: async (tournament) => {
    //   await queryClient.cancelQueries(tournamentKeys.id("current"))

    //   //optimistic update
    //   queryClient.setQueriesData(tournamentKeys.id("current"), tournament);
    //   queryClient.invalidateQueries(tournamentKeys.lists);

    //   return tournament;
    // },
    // onError: (err, variables, optimistic) => {
    //   // queryClient.invalidateQueries(tournamentKeys.all);
    // }
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

  return {
    data: tournament?.divisions.find(d => d.id === id)
  }
}

export const useDivisions = (tournamentId?: string) => {
  const { data: tournament } = useTournament(tournamentId);

  return {
    data: tournament?.divisions as TDivision[]
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

