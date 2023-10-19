import { Link } from "react-router-dom";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  SpeedDialIcon,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { useNavigate, useParams } from "react-router-dom";
import { useRemoveUserFromTeam, useTeam } from "./hooks.ts";
import { useUpdateUser, useUser } from "../user/hooks.ts";
import BannerPage from "../viewer/BannerPage.tsx";
import GradientTitle from "../viewer/gradientTitle.tsx";
import { PromptContainer } from "../participant/registration.tsx";
import { useTournament } from "../viewer/hooks.ts";

dayjs.extend(relativeTime);

function TeamProfilePage() {
  //FIXME: think about encoding and decoding practices
  const { name } = useParams();

  const { data: tournament } = useTournament("current");

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
        link: `${domain}/team/join?id=${team.id}&token=${token}`,
        countdown: dayjs().to(expiresAt),
      };
    },

    enabled: false,
    staleTime: Infinity,
  });

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(invite?.link);
  };

  const removeUserFromTeam = useRemoveUserFromTeam();
  const handleLeaveTeam = () => {
    removeUserFromTeam.mutate({ userId: user.id, teamId: team.id });
  };

  if (teamStatus !== "success") {
    return <div>loadgi team profiel</div>;
  }

  if (!team) return <PromptContainer>
    <Typography>404 not found. Sorry, we went looking for this page but we couldn't find who asked.</Typography>
  </PromptContainer>

  const isManager = user?.id === team?.manager;
  const isMember = user?.team?.id === team.id;
  console.log(tournament)
  //FIXME: refactor to model
  // const isRegistration = tournament?.registration?.from && tournament?.registration?.from >= new Date() && (tournament?.registration?.to ? tournament?.registration?.to <= new Date() : true);

  return (
    <Box sx={{ mt: -6 }}>
      <GradientTitle justifyContent={"left"} paddingLeft={"20vw"}>
        <Box component={"img"}>

        </Box>
        <Stack spacing={-1} direction="column">
          <Typography variant="h5">THIS IS</Typography>
          <Typography variant="h2">{team.name.toUpperCase()}</Typography>
        </Stack>
      </GradientTitle>
      <Container maxWidth="md">
        {isManager ? <Button onClick={() => fetchInvite()}>Invite</Button> : null}
        {isManager && tournament?.registration?.isOpen ? <Link to={`/tournament/register`}>
          <Button>Register</Button></Link> : null}
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
      </Container>
    </Box>
  );
}

export default TeamProfilePage;
