import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export const teamKeys = {
  all: ["teams"],
  details: () => [teamKeys.all, "detail"],
  detail: (id: string) => [...teamKeys.details(), id],
};

export const useTeam = (name: string) => {
  return useQuery({
    queryKey: teamKeys.detail(name),
    queryFn: async () => {
      const response = await axios.get(`/api/teams/?name=${name}`);
      return response.data[0] || null; //FIXME: assuming the response is array; maybe do this validation on server?
    },
    enabled: Boolean(name),
  });
};
