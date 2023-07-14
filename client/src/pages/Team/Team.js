import { useContext, useEffect } from "react";
import { AuthContext } from "../..";
import {
  Alert,
  AlertTitle,
  Button,
  IconButton,
  InputAdornment,
  SpeedDialIcon,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function TeamPage() {
  const { name } = useParams();

  const { status: teamStatus, data: team, refetch: refetchTeam} = useQuery({
    queryKey: ["teams", name],
    queryFn: async () => {
      const team = await axios.get(`/api/teams?name=${name}`);
      return team.data;
    },
  });

  const {
    status: inviteStatus,
    data: invite,
    refetch: fetchInvite,
  } = useQuery({
    queryKey: ["invite"],
    queryFn: async () => {
      const invite = await axios.get(`/api/teams/${team.id}/invite`);

      return {
        link: `/api/teams/${team.id}/join/${invite.data.token}`,
        countdown: dayjs().to(invite.data.expiresAt),
      };
    },

    enabled: false,
    staleTime: Infinity,
  });

  const handleCopyText = () => {
    navigator.clipboard.writeText(invite.link);
  };

  if (teamStatus === "loading") {
    return <div>loadgi team profiel</div>;
  }

  return (
    <>
      <h1>{team.name}</h1>
      <h2>{team.manager}</h2>
      <Button onClick={() => team ? fetchInvite() : refetchTeam()}>Invite</Button>
      {inviteStatus === "success" ? (
        <Alert>
          <AlertTitle>Generated invite link!</AlertTitle>
          <Typography>
            Only share this link with players you trust. The invite will
            automatically expire {invite.countdown}.
          </Typography>
          <TextField
          fullWidth
            disabled
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleCopyText}>
                    <SpeedDialIcon></SpeedDialIcon>
                  </IconButton>
                </InputAdornment>
              ),
            }}
            value={invite.link}
          ></TextField>
        </Alert>
      ) : null}
    </>
  );
}

export default TeamPage;
