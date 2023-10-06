import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const userKeys = {
  all: ["users"],
  details: () => [...userKeys.all, "detail"],
  detail: (id: string) => [...userKeys.details(), id],
};

//TODO: refactr useMe to be abl to use id as queryKey
export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
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
      queryClient.invalidateQueries(userKeys.detail(data.id)); 
    },
  });
};
