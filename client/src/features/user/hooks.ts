import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { QueryKeyFactory } from "../../types";
import {TUser} from "@backend/models/user.ts";

export const userKeys: QueryKeyFactory<TUser> = {
  all: "users",
  id: (id: string) => [userKeys.all, id],
  query: (query) => [userKeys.all, query], 
};

//TODO: refactr useMe to be abl to use id as queryKey
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values) => {
      const res = await axios.patch(`/api/users/${values.id}`, values);
      return res.data;
    },
    onSuccess(data) {
      queryClient.invalidateQueries(userKeys.id(data.id)); 
    },
  });
};
