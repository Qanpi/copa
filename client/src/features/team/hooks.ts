import axios from "axios";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeyFactory } from "../types";
import { TTeam } from "@backend/models/team";
import { useNavigate } from "react-router-dom";
import { userKeys } from "../user/hooks";
import { participantKeys } from "../participant/hooks";
import { TParticipant } from "@backend/models/participant";

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
        return previous?.map(t => t.name === team.name ? team : t);
      })
    },
  });
};

export const useTeam = (name?: string) => {
  return useQuery({
    queryKey: teamKeys.id(name),
    queryFn: async () => {
      const response = await axios.get(`/api/teams/?name=${name}`);
      return response.data[0] as TTeam || null; //FIXME: assuming the response is array; maybe do this validation on server?
    },
    enabled: Boolean(name),
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Partial<TTeam>) => {
      const res = await axios.post("/api/teams", {
        ...values,
        name: values?.name?.trim(), //FIXME: encode uri?
      });
      return res.data as TTeam;
    },
    onSuccess: (newTeam) => {
      queryClient.setQueriesData(teamKeys.id(newTeam.id), newTeam);
      queryClient.setQueriesData(teamKeys.lists, (previous?: TTeam[]) => {
        return previous?.map(p => p.id === newTeam.id ? newTeam : p);
      })

      queryClient.invalidateQueries(userKeys.id("me"));
    },
  });
}

export const useRemoveUserFromTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string, userId: string }) => {
      const res = await axios.delete(`/api/teams/${teamId}/users/${userId}`);
      return res.data;
    },

    onSuccess: (data, {teamId, userId}) => {
      queryClient.invalidateQueries(userKeys.id("me"));
      queryClient.invalidateQueries(userKeys.id(userId));

      queryClient.invalidateQueries(teamKeys.id(teamId));
    }

  })
}

export const useParticipations = (teamId?: string) => {
  return useQuery({
    queryFn: async () => {
      const res = await axios.get(`/api/teams/${teamId}/participations`);
      return res.data as TParticipant[];
    },
    enabled: !!teamId
  })
}


