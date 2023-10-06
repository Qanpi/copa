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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import { useTeam } from "../hooks.ts";
import { useUpdateUser, useUser, userKeys } from "../../user/hooks.ts";

function JoinTeamPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [joined, setJoined] = useState(false);

  const { data: user } = useUser("me");
  const { data: team } = useTeam(user.team?.name);

  const queryClient = useQueryClient();
  const joinTeam = useMutation({
    mutationFn: async (values) => {
      if (!id || !token) throw TypeError("Missing id or token.");

      const res = await axios.post(`/api/teams/${values.id}/join`, {
        token: values.token,
      });

      return res.data;
    },
    onSuccess: (team) => {
      //TODO: updated user's team via queryClient
      queryClient.invalidateQueries(userKeys.details("me"));
      setJoined(true);
    },
  });

  const updateUser = useUpdateUser();

  const id = searchParams.get("id");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!user.team) joinTeam.mutate({ id, token });
  }, [user.team, searchParams]);

  if (joined) {
    return (
      <>
        <Typography>
          Congratulations! You are now part of {team.name}. Visis tems page.
        </Typography>
      </>
    );
  }

  const handleDialog = async (choice) => {
    if (choice) {
      await updateUser.mutateAsync({ id: user.id, team: null });
      joinTeam.mutate({ id, token });
    } else {
    }
  };

  if (user.team) {
    return (
      <Dialog open={true}>
        <DialogTitle>You are currently in a team.</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Would you like to first leave your current team?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialog(true)}>Yes</Button>
          <Button onClick={() => handleDialog(false)}>No</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // return (
  //   <>
  //     <Typography>
  //       You are currently part of {team.name}. Would you like to leave that
  //       team first?
  //     </Typography>
  //   </>
  // );

  return (
    <Alert severity="error">
      <AlertTitle>Invalid or expired token.</AlertTitle>
      Please ask the team manager to resend invite link or contact support.
    </Alert>
  );
}

export default JoinTeamPage;
