import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { TUser } from "@backend/models/user.ts";
import { useTeam, useUpdateTeam } from "../team/hooks";
import { QueryKeyObject, queryKeyFactory } from "../types";

export const userKeys = queryKeyFactory<TUser & { teamId?: string }>("users");

export const useUser = (id?: string) => {
  return useQuery({
    queryKey: userKeys.id(id),
    queryFn: async () => {
      if (id === "me") {
        const res = await axios.get("/me");
        return res.data as TUser;
      } else {
        const res = await axios.get(`/api/${userKeys.all}/${id}`);
        return res.data as TUser | "private";
      }
    },
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const { data: me } = useUser("me");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Partial<TUser>) => {
      const res = await axios.patch(`/api/users/${values.id}`, values);
      return res.data as TUser;
    },
    onSuccess(data) {
      if (me.id === data.id) queryClient.setQueryData(userKeys.id("me"), data);

      queryClient.setQueryData(userKeys.id(data.id), data);
      queryClient.setQueryData(userKeys.lists, (previous?: TUser[]) => {
        return previous?.map(user => user.id === data.id ? data : user)
      });
    },
  });
};

export const useTeamMembers = (teamId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: userKeys.list({ teamId }),

    queryFn: async () => {
      const res = await axios.get(`/api/teams/${teamId}/users`);
      return res.data as TUser[];
    },

    enabled: !!teamId
  })
}