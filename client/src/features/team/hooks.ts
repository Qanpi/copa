import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeyFactory } from "../types";
import { TTeam } from "@backend/models/team";

export const teamKeys = queryKeyFactory<TTeam>("team");

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Partial<TTeam>) => {
      const res = await axios.patch(`/api/teams/${values.id}`, values);
      return res.data as TTeam;
    },
    onSuccess: (team) => {
      queryClient.setQueryData(teamKeys.id(team.name), team);
      queryClient.setQueryData(teamKeys.lists, (previous: TTeam[]) => {
        return previous.map(t => t.name === team.name ? team : t);
      })
    },
  });
};

export const useTeam = (name: string) => {
  return useQuery({
    queryKey: teamKeys.id(name),
    queryFn: async () => {
      const response = await axios.get(`/api/teams/?name=${name}`);
      return response.data[0] || null; //FIXME: assuming the response is array; maybe do this validation on server?
    },
    enabled: Boolean(name),
  });
};

