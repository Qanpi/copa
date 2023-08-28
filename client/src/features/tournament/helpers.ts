import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/react-query";
import axios from "axios";
import { Id } from "../../types";

export const tournamentKeys = {
  all: ["tournaments"],
  details: () => [...tournamentKeys.all, "detail"],
  detail: (id: Id) => [...tournamentKeys.details(), id],
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

export const useUpdateTournament = (id: Id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values) => {
      const res = await axios.patch(`/api/tournaments/${id}`, values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(tournamentKeys.detail(id));
    },
  });
};

export const useCreateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body) => {
      const res = await axios.post(`/api/tournaments/`, body);
      return res.data;
    },
    onSuccess: (tournament) => {
      queryClient.setQueryData(["tournament", "detail", "current"], tournament);
    },
  });
};

