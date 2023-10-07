import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { QueryKeyFactory } from "../../types";
import { TUser } from "@backend/models/user.ts";
import { useTeam, useUpdateTeam } from "../team/hooks";

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
    mutationFn: async (values: Partial<TUser>) => {
      const res = await axios.patch(`/api/users/${values.id}`, values);
      return res.data;
    },
    onSuccess(data) {
      queryClient.invalidateQueries(userKeys.id(data.id));
    },
  });
};

// export const useLeaveTeam = (id: string) => {
//   const {data: user} = useUser(id);
//   const {data: team} = useTeam(user.team.name);
//   const {data: members} = useUsers({
//     team: team.id
//   });

//   const updateUser = useUpdateUser();
//   const updateTeam = useUpdateTeam();

//   return useMutation({
//     mutationFn: async () => {
//       if (team.manager === user.id) {
//         const members = await 
//       }

//       const res = await updateUser.mutateAsync({ id: user.id, team: null });
//       return res.data;
//     }
//   })
//   //check if manager


// };
