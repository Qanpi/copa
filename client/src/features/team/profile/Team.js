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
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { useParams } from "react-router-dom";
import { useTeam } from "../hooks.ts";
import { useUser } from "../../user/hooks.ts";

dayjs.extend(relativeTime);

function TeamPage() {
  const { name } = useParams();

  const {data: user} = useUser("me");
  const {data: team, status: teamStatus} = useTeam(name);


  const {
    status: inviteStatus,
    data: invite,
    refetch: fetchInvite,
  } = useQuery({
    queryKey: ["invite"],
    queryFn: async () => {
      const invite = await axios.get(`/api/teams/${team.id}/invite`);
      const {token, expiresAt} = invite.data;

      return {
        //FIXME: localhost
        link: `localhost:3000/teams/join?id=${team.id}&token=${token}`,
        countdown: dayjs().to(expiresAt),
      };
    },

    enabled: false,
    staleTime: Infinity,
  });

  const handleCopyText = () => {
    navigator.clipboard.writeText(invite.link);
  };

  if (teamStatus !== "success") {
    return <div>loadgi team profiel</div>;
  }

  const isManager = user?.id === team?.manager;

  return (
    <>
      <h1>{team.name}</h1>
      {isManager ? <Button onClick={() => fetchInvite()}>Invite</Button> : null}
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
