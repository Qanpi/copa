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
import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import { useTeam, useTeamById } from "./hooks.ts";
import { useUpdateUser, useAuth, userKeys } from "../user/hooks.ts";
import LeaveTeamDialog from "./LeaveTeamDialog.tsx";
import { TUser } from "@backend/models/user.ts";
import { TTeam } from "@backend/models/team.ts";

function JoinTeamPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: user } = useAuth();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const joinTeam = useMutation({
    mutationFn: async (values: TTeam["invite"] & {id: string}) => {
      if (!id || !values.token) throw TypeError("Missing id or token.");

      const res = await axios.post(`/api/teams/${values.id}/join`, {
        token: values.token,
      });

      return res.data as TUser;
    },
    onSuccess: (user) => {
      //TODO: updated user's team via queryClient
      // queryClient.invalidateQueries(userKeys.details("me"));
      navigate(`/teams/${user.team.name}`);
    },
  });

  const id = searchParams.get("id");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!user?.team) joinTeam.mutate({ id, token });
    else if (user.team.id === id) return navigate(`/teams/${user.team.name}`);
  }, [user]);

  if (!user) return <>Loadng...</>;

  //TODO: trigger rerender using react-query on user team leave
  return (
    <>
      {user.team && user.team.id !== id ? (
        <LeaveTeamDialog
          onLeave={() => joinTeam.mutate({ id, token })}
          onStay={() => navigate(`/teams/${user.team.name || "none"}`)}
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
