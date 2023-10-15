import { Link } from "react-router-dom";
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
import { useNavigate, useParams } from "react-router-dom";
import { useTeam } from "./hooks.ts";
import { useUpdateUser, useUser } from "../user/hooks.ts";

dayjs.extend(relativeTime);

function TeamPage() {
  //FIXME: think about encoding and decoding practices
  const { name } = useParams();

  const { data: user } = useUser("me");
  const { data: team, status: teamStatus } = useTeam(name);

  const {
    status: inviteStatus,
    data: invite,
    refetch: fetchInvite,
  } = useQuery({
    queryKey: ["invite"],
    queryFn: async () => {
      const invite = await axios.get(`/api/teams/${team.id}/invite`);
      const { token, expiresAt } = invite.data;

      const domain = window.location.host;
      return {
        link: `${domain}/teams/join?id=${team.id}&token=${token}`,
        countdown: dayjs().to(expiresAt),
      };
    },

    enabled: false,
    staleTime: Infinity,
  });

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(invite.link);
  };

  const updateUser = useUpdateUser();

  const handleLeaveTeam = () => {
    updateUser.mutate({
      id: user.id,
      team: null,
    });
  };

  if (teamStatus !== "success") {
    return <div>loadgi team profiel</div>;
  }

  const isManager = user?.id === team?.manager;
  const isMember = user?.team?.id === team.id;

  return (
    <>
      <h1>{team.name}</h1>
      {isManager ? <Button onClick={() => fetchInvite()}>Invite</Button> : null}
      {isManager ? <Link to={`/tournament/register`}>Register</Link> : null}
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
                  <IconButton onClick={handleCopyInviteLink}>
                    <SpeedDialIcon></SpeedDialIcon>
                  </IconButton>
                </InputAdornment>
              ),
            }}
            value={invite.link}
          ></TextField>
        </Alert>
      ) : null}
      {isMember ? <Button onClick={handleLeaveTeam}>Leave team</Button> : null}
    </>
  );
}

export default TeamPage;
