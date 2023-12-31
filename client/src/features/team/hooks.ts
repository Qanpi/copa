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
      queryClient.setQueryData(teamKeys.id(team.id), team);
      queryClient.setQueryData(teamKeys.lists, (previous: TTeam[] | undefined) => {
        return previous?.map(t => t.id === team.id ? team : t);
      })
    },
  });
};

export const useTeam = (name?: string) => {
  return useQuery({
    queryKey: teamKeys.id(name!),
    queryFn: async () => {
      const response = await axios.get(`/api/teams/?name=${encodeURIComponent(name!)}`);
      return response.data[0] as TTeam || null; //assumed to be array of length 1 since names are unique
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
        name: values?.name?.trim(),
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
    queryKey: participantKeys.list({team: teamId}),
    queryFn: async () => {
      const res = await axios.get(`/api/teams/${teamId}/participations`);
      return res.data as TParticipant[];
    },
    enabled: !!teamId
  })
}

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (team: TTeam) => {
      const res = await axios.delete(`/api/teams/${team.id}`);
      return res.data; 
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(teamKeys.lists);
      queryClient.invalidateQueries(teamKeys.id(variables.id));
      queryClient.invalidateQueries(userKeys.id("me"));
    }
  })
}


