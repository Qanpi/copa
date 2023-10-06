import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const userKeys = {
  all: ["users"],
  details: () => [...userKeys.all, "detail"],
  detail: (id: string) => [...userKeys.details(), id],
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const res = id === "me"
        ? await axios.get("/me")
        : await axios.get(`/api/${userKeys.all}/${id}`);
      return res.data;
    },
  });
};

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async (values) => {
      const res = await axios.patch(`/api/users/${values.id}`, values);
      return res.data;
    }
  })
}
