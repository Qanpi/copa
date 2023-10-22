import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import { useTeam, useTeamById } from "./hooks.ts";
import { useUpdateUser, useAuth, userKeys } from "../user/hooks.ts";
import LeaveTeamDialog from "./LeaveTeamDialog.tsx";
import { TUser } from "@backend/models/user.ts";
import { TTeam } from "@backend/models/team.ts";
import { LoadingBackdrop } from "../layout/LoadingBackdrop.tsx";
import { PromptContainer } from "../layout/PromptContainer.tsx";

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
    else if (user.team.id === id) return navigate(`/teams/${user.team.name}`);
  }

  useEffect(() => {
    handleJoinTeam();
  }, [id, token, user]);

  if (!user) return <>Loadng...</>;

  //TODO: trigger rerender using react-query on user team leave
  return (
    <>
      {user.team && user.team.id !== id ? (
        <LeaveTeamDialog
          onLeave={handleJoinTeam}
          onStay={() => navigate(`/teams/${user.team!.name}`)}
        ></LeaveTeamDialog>
      ) : null}
      {/* {errorAlert ? (
        <Alert severity="error">
          <AlertTitle>Invalid or expired token.</AlertTitle>
          Please ask the team manager to resend invite link or contact support.
        </Alert>
      ) : null} */}
    </>
  );
}

export default JoinTeamPage;
