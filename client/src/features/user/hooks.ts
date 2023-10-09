import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { TUser } from "@backend/models/user.ts";
import { useTeam, useUpdateTeam } from "../team/hooks";
import { QueryKeyObject, queryKeyFactory } from "../types";

export const userKeys = queryKeyFactory<TUser>("user");

export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.id(id),
    queryFn: async () => {
      const res =
        id === "me"
          ? await axios.get("/me")
          : await axios.get(`/api/${userKeys.all}/${id}`);
      return res.data;
    },
  });
};

export const useUpdateUser = () => {
  const {data: me} = useUser("me");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Partial<TUser>) => {
      const res = await axios.patch(`/api/users/${values.id}`, values);
      return res.data;
    },
    onSuccess(data: TUser) {
      const id = me.id === data.id ? "me" : data.id;
      queryClient.setQueryData(userKeys.id(id), data);

      queryClient.setQueryData(userKeys.lists, (previous: TUser[]) => {
        return previous.map(user => user.id === data.id ? data : user)
      });
    },
  });
};
