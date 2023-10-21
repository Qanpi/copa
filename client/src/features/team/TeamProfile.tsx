import { Link } from "react-router-dom";
import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Button,
  ClickAwayListener,
  Container,
  Dialog,
  IconButton,
  InputAdornment,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { useNavigate, useParams } from "react-router-dom";
import { useRemoveUserFromTeam, useTeam } from "./hooks.ts";
import { useTeamMembers, useUpdateUser, useUser } from "../user/hooks.ts";
import BannerPage from "../viewer/BannerPage.tsx";
import GradientTitle from "../viewer/gradientTitle.tsx";
import { PromptContainer } from "../layout/PromptContainer.tsx";
import { useTournament } from "../viewer/hooks.ts";
import { useState } from "react";
import NotFoundPage from "../layout/NotFoundPage.tsx";
import { TTeam } from "@backend/models/team.ts";
import { AddLink, ContentCopy, DeleteForever, Edit, MeetingRoom, VisibilityOff } from "@mui/icons-material";
import OutlinedContainer from "../layout/OutlinedContainer.tsx";
import { useMatches } from "../match/hooks.ts";

dayjs.extend(relativeTime);

function TeamProfilePage() {
  //FIXME: think about encoding and decoding practices
  const { name } = useParams();
  const encoded = name ? encodeURIComponent(name) : undefined;
  const { data: team, status: teamStatus } = useTeam(encoded);

  const [selectedTab, setSelectedTab] = useState(0);
  const handleChangeSelectedTab = (_, newTab: number) => {
    setSelectedTab(newTab);
  }

  const {data: tournament} = useTournament("current");
  const upcomingMatches = useMatches(tournament?.id, {
    team: team?.id,
  });

  if (teamStatus !== "success") {
    return <div>loadgi team profiel</div>;
  }

  if (!team) return <NotFoundPage></NotFoundPage>

  //FIXME: refactor to model
  // const isRegistration = tournament?.registration?.from && tournament?.registration?.from >= new Date() && (tournament?.registration?.to ? tournament?.registration?.to <= new Date() : true);

  return (
    <Box sx={{ pt: 15 }}>
      <GradientTitle justifyContent={"left"} paddingLeft={"5vw"} sx={{ mb: 0 }}>
        <Box component={"img"} sx={{ objectFit: "contain", maxHeight: "300px", maxWidth: "300px", width: "30vw", position: "absolute" }} src={team.bannerUrl}>
        </Box>
        <Stack spacing={-1} direction="column" sx={{ ml: { xs: "35vw", md: "310px" } }}>
          <Typography variant="h5">THIS IS</Typography>
          <Typography variant="h1" fontWeight={800}>{team.name}</Typography>
        </Stack>
        <Typography variant="subtitle1" sx={{ ml: "auto", alignSelf: "end" }}>Est. {dayjs(team.createdAt).format("YYYY")}</Typography>
      </GradientTitle>
      <Box sx={{ ml: { xs: "38vw", md: "calc(300px + 5vw)" }, height: "50px" }}>
        <Tabs value={selectedTab} onChange={handleChangeSelectedTab}>
          <Tab label="Profile"></Tab>
          <Tab label="Timeline"></Tab>
          <Tab label="Settings"></Tab>
        </Tabs>
      </Box>
      <Container maxWidth="md" sx={{ p: 5, pt: 10 }}>
        {selectedTab === 0 ? <ProfileTab team={team}></ProfileTab> : null}
        {selectedTab === 1 ? <TimelineTab></TimelineTab> : null}
        {selectedTab === 2 ? <TimelineTab></TimelineTab> : null}
      </Container>
      <TeamSpeedDial team={team}></TeamSpeedDial>
    </Box>
  );
}

const TimelineTab = () => {
  return (
    <Typography>This feature is still in development.</Typography>
  )
}

const ProfileTab = ({team} : {team: TTeam}) => {
  const { data: user } = useUser("me");
  const { data: members } = useTeamMembers(team?.id);

  return (
    <Stack direction="column" spacing={4}>
      {team.about ?
        <OutlinedContainer>

          <Typography variant="h6" color="primary">About</Typography>
          <Typography>{team.about}</Typography>

        </OutlinedContainer>
        : null}
      {members && members.length > 0 ? <OutlinedContainer>
        <Typography variant="h6" color="primary">Squad</Typography>
        <Box sx={{ display: "grid", gap: 3, p: 3, gridTemplateColumns: "repeat(auto-fill, 100px)", gridTemplateRows: "repeat(auto-fill, 120px)" }}>
          {members?.map(m => {
            const visible = m?.preferences?.publicProfile;

            return (
              <Box sx={{ alignItems: "center", flexDirection: "column" }} display="flex">
                <Box key={m.id} display="flex" alignItems="center" justifyContent={"center"}>
                  <Avatar sx={{ width: "100px", height: "100px", opacity: visible ? 1 : 0.5 }} src={m.avatar} ></Avatar>
                  {visible ? null : <Tooltip arrow title={m.id === user?.id ? "Your profile is only visible to your team members by default. You can change this option on your profile page." : ""}>
                    <VisibilityOff sx={{ position: "absolute" }}></VisibilityOff>
                  </Tooltip>}
                </Box>
                <Typography>{m.name}</Typography>
              </Box>
            )
          }
          )}
        </Box>
      </OutlinedContainer> : null}
    </Stack>
  )
}

const TeamSpeedDial = ({ team }: { team: TTeam }) => {
  const { data: tournament } = useTournament("current");
  const { data: user } = useUser("me");

  const fetchInvite = useMutation({
    mutationFn: async (values: Partial<TTeam>) => {
      const invite = await axios.get(`/api/teams/${values.id}/invite`);
      const { token, expiresAt } = invite.data;

      const domain = window.location.host;

      return {
        link: `${domain}/team/join?id=${values.id}&token=${token}`,
        countdown: dayjs().to(expiresAt),
      };
    },

  });
  const [invite, setInvite] = useState({
    link: undefined,
    countdown: undefined
  });

  const handleFetchInvite = () => {
    fetchInvite.mutate(team, {
      onSuccess: (data) => {
        setInvite(data);
      }
    })
  }

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(invite?.link);
    setInvite({})
  };

  const removeUserFromTeam = useRemoveUserFromTeam();
  const handleLeaveTeam = () => {
    removeUserFromTeam.mutate({ userId: user.id, teamId: team.id });
  };

  const isManager = user?.id === team?.manager;
  const isMember = user?.team?.id === team.id;

  <Container maxWidth="md">
    {isManager && tournament?.registration?.isOpen ? <Link to={`/tournament/register`}>
      <Button>Register</Button></Link> : null}
  </Container>

  return (
    <>
      <Dialog open={invite?.link}>
        <ClickAwayListener onClickAway={() => setInvite({})}>
          <Alert>
            <AlertTitle>Generated invite link!</AlertTitle>
            <Typography>
              Only share this link with players you trust. The invite will
              automatically expire {invite.countdown} or when you request a new link.
            </Typography>
            <TextField
              fullWidth
              disabled
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleCopyInviteLink}>
                      <ContentCopy></ContentCopy>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              value={invite.link}
              sx={{ mt: 1 }}
            ></TextField>
          </Alert>
        </ClickAwayListener>
      </Dialog>
      {isMember ? <SpeedDial ariaLabel="Team Speed Dial" sx={{ position: "absolute", bottom: 30, right: 30 }}
        icon={<SpeedDialIcon></SpeedDialIcon>}>
        {isManager ? <SpeedDialAction icon={<Edit></Edit>} tooltipTitle="Edit profile"></SpeedDialAction> : null}
        {isManager ? <SpeedDialAction icon={<AddLink></AddLink>} tooltipTitle="Invite member" onClick={handleFetchInvite}></SpeedDialAction> : null}
        <SpeedDialAction icon={<MeetingRoom></MeetingRoom>} tooltipTitle="Leave team" onClick={handleLeaveTeam}></SpeedDialAction>
        {isManager ? <SpeedDialAction icon={<DeleteForever></DeleteForever>} tooltipTitle="Delete team"></SpeedDialAction> : null}
      </SpeedDial> : null}
    </>
  )
}

export default TeamProfilePage;
