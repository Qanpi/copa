import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const userKeys = {
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
