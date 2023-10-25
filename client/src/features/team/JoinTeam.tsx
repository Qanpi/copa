import { TTeam } from "@backend/models/team.ts";
import { TUser } from "@backend/models/user.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { LoadingBackdrop } from "../layout/LoadingBackdrop.tsx";
import { useAuth, userKeys } from "../user/hooks.ts";
import LeaveTeamDialog from "./LeaveTeamDialog.tsx";

function JoinTeamPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: user } = useAuth();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const joinTeam = useMutation({
    mutationFn: async (values: TTeam["invite"] & {id: string}) => {
      const res = await axios.post(`/api/teams/${values.id}/join`, {
        token: values.token
      });

      return res.data as TUser;
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries(userKeys.id("me"));
      navigate(`/teams/${user.team!.name}`);
    },
  });

  const id = searchParams.get("id");
  const token = searchParams.get("token");

  const handleJoinTeam = () => {
    if (!id || !token || !user) return;

    if (!user?.team) joinTeam.mutate({ id, token });
    else if (user.team.id === id) return navigate(`/teams/${encodeURIComponent(user.team.name)}`);
  }

  useEffect(() => {
    handleJoinTeam();
  }, [id, token, user]);

  if (!user) return <LoadingBackdrop open={true}></LoadingBackdrop>;

  return (
    <>
      {user.team && user.team.id !== id ? (
        <LeaveTeamDialog
          onLeave={handleJoinTeam}
          onStay={() => navigate(`/teams/${user.team!.name}`)}
        ></LeaveTeamDialog>
      ) : null}
    </>
  );
}

export default JoinTeamPage;
