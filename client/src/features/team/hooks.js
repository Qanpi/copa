import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values) => {
      const res = await axios.patch(`/api/teams/${values.id}`, values);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["teams", data.id], data);
    },
  });
};
