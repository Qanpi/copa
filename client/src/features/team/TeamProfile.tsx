import { Link } from "react-router-dom";
import * as Yup from "yup"
import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Button,
  Card,
  ClickAwayListener,
  Container,
  Dialog,
  IconButton,
  InputAdornment,
  Skeleton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  Tab,
  Tabs,
  TabsProps,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { useNavigate, useParams } from "react-router-dom";
import { useRemoveUserFromTeam, useTeam, useUpdateTeam } from "./hooks.ts";
import { useTeamMembers, useUpdateUser, useAuth } from "../user/hooks.ts";
import BannerPage from "../viewer/BannerPage.tsx";
import GradientTitle from "../viewer/gradientTitle.tsx";
import { PromptContainer } from "../layout/PromptContainer.tsx";
import { useTournament } from "../viewer/hooks.ts";
import { memo, useCallback, useMemo, useState } from "react";
import NotFoundPage from "../layout/NotFoundPage.tsx";
import { TTeam } from "@backend/models/team.ts";
import { AddLink, Clear, ContentCopy, DeleteForever, Edit, MeetingRoom, Save, VisibilityOff } from "@mui/icons-material";
import OutlinedContainer from "../layout/OutlinedContainer.tsx";
import { useMatches } from "../match/hooks.ts";
import { useParticipants } from "../participant/hooks.ts";
import { Form, Formik, useField, useFormikContext } from "formik";
import { TeamBannerInput, teamValidationSchema } from "./CreateTeam.tsx";
import MyTextField from "../inputs/myTextField.tsx";
import { TFeedback } from "../types.ts";
import { FeedbackSnackbar } from "../layout/FeedbackSnackbar.tsx";

dayjs.extend(relativeTime);

function TeamProfilePage() {
  //FIXME: think about encoding and decoding practices
  const { name } = useParams();
  const encoded = name ? encodeURIComponent(name) : undefined;
  const { data: team, status: teamStatus, isLoading } = useTeam(encoded);
  const { data: user } = useAuth();

  const [selectedTab, setSelectedTab] = useState(0);
  const handleChangeSelectedTab = useCallback((_, newTab: number) => {
    setSelectedTab(newTab);
  }, [])

  const [feedback, setFeedback] = useState<TFeedback>({});

  const updateTeam = useUpdateTeam();
  const [editMode, setEditMode] = useState(false);
  const handleEditClick = useCallback(
    () => {
      setEditMode(m => !m)
    }
    , [])

  const handleSubmit = (values) => {
    updateTeam.mutate(values, {
      onSuccess: () => {
        setEditMode(false);
        setFeedback({
          severity: "success",
          message: "Updated information succesfully."
        });
      }
    })
  }

  const handleCancelEdit = () => {
    setEditMode(false);
  }

  const { data: tournament } = useTournament("current");
  const upcomingMatches = useMatches(tournament?.id, {
    team: team?.id,
  });


  if (!isLoading && !team) return <NotFoundPage></NotFoundPage>

  return (
    <Formik enableReinitialize validationSchema={Yup.object(teamValidationSchema)} initialValues={team || {}} onSubmit={handleSubmit}>
      {
        ({ values: team, dirty, submitForm, resetForm }) => {
          return (
            <Form>
              <FeedbackSnackbar feedback={feedback} onClose={() => setFeedback({})}></FeedbackSnackbar>
              <Box sx={{ pt: 15 }} display="flex" flexDirection={"column"} height={"100%"}>
                <GradientTitle justifyContent={"left"} paddingLeft={"5vw"} sx={{ mb: 0 }}>
                  <Box sx={{ width: "30vw", height: "300px", maxWidth: "300px", maxHeight: "300px", position: "absolute" }}>
                    {isLoading ? <Skeleton variant="circular" sx={{height: "100%"}}></Skeleton> :
                      <TeamBannerInput name={"bannerUrl"} edit={editMode} sx={{width: "100%", height: "100%" }}></TeamBannerInput>}
                  </Box>
                  <Stack spacing={-1} direction="column" sx={{ ml: { xs: "35vw", md: "320px" } }}>
                    <Typography variant="h5">THIS IS</Typography>
                    <Typography variant="h1" fontWeight={800}>{team?.name || <Skeleton sx={{ width: "4em" }}></Skeleton>}</Typography>
                  </Stack>
                  <Typography variant="subtitle1" sx={{ ml: "auto", alignSelf: "end" }}>Est. {team ? dayjs(team?.createdAt).format("YYYY") : ""}</Typography>
                </GradientTitle>
                <TabBar teamId={team.id} selected={selectedTab} onChange={handleChangeSelectedTab}></TabBar>
                <Container maxWidth="md" sx={{ p: 5, pt: 10, position: "relative", height: "100%" }}>
                  {selectedTab === 0 ? <ProfileTab team={team} editMode={editMode}></ProfileTab> : null}
                  {selectedTab === 1 ? <TimelineTab team={team}></TimelineTab> : null}
                  {selectedTab === 2 ? <TimelineTab team={team}></TimelineTab> : null}
                </Container>
              </Box>
              <Box sx={{ position: "fixed", bottom: 30, right: 30 }}>
                {dirty ? <SpeedDial ariaLabel="Save updates" icon={<IconButton onClick={submitForm} size="large"><Save ></Save></IconButton>}>
                  <SpeedDialAction icon={<Clear></Clear>} tooltipTitle={"Cancel"} onClick={() => {
                    handleCancelEdit();
                    resetForm();
                  }}></SpeedDialAction>
                </SpeedDial>
                  : <TeamSpeedDial teamName={team?.name} onEditClick={handleEditClick}>
                  </TeamSpeedDial>}
              </Box>
            </Form>
          )
        }
      }
    </Formik >
  );
}

// const TeamBanner = ({ src }: { src: string }) => {
//   return (
//     <Box component={"img"} sx={{ objectFit: "contain", maxHeight: "300px", maxWidth: "300px", width: "30vw", position: "absolute" }} src={src}></Box>
//   )
// }

const TabBar = memo(function TabBar({ selected, onChange, teamId }: { selected: number, onChange: TabsProps["onChange"], teamId: string }) {
  const { data: user } = useAuth();
  const isMember = user?.team?.id === teamId;

  if (!teamId) return <Skeleton variant="rectangular">
    <Tabs></Tabs>
  </Skeleton>

  return <Box sx={{ ml: { xs: "38vw", md: "calc(310px + 5vw)" }, height: "50px" }}>
    <Tabs value={selected} onChange={onChange}>
      <Tab label="Profile"></Tab>
      <Tab label="Timeline"></Tab>
      {isMember ? <Tab label="Settings"></Tab> : null}
    </Tabs>
  </Box>
})

const TimelineTab = ({ team }: { team?: TTeam }) => {
  // const {data: participantions} = useParticipants({
  //   team: team.id,
  // });

  return (
    <Typography>This feature is still in development.</Typography>
  )
}

const AboutSection = ({ name, open, edit }: { name: string, open: boolean, edit: boolean }) => {
  const [field, meta] = useField(name);

  if (!open) return;

  return (
    <OutlinedContainer>
      <Typography variant="h6" color="primary">About</Typography>
      {edit ?
        <Stack direction="column" spacing={1} sx={{ width: "100%" }}>
          <MyTextField multiline minRows={2} name={name}></MyTextField>
          {/* {meta.touched ? <Button type="submit">Update</Button> : null} */}
        </Stack> : <Typography>{field.value}</Typography>}
    </OutlinedContainer>
  )
}

const ProfileTab = ({ team, editMode }: { team?: TTeam, editMode: boolean }) => {
  const { data: user } = useAuth();
  const { data: members } = useTeamMembers(team?.id);

  const { values, initialValues } = useFormikContext<TTeam>();

  return (
    <Stack direction="column" spacing={4}>
      <AboutSection open={team?.about !== "" || editMode} name="about" edit={editMode}></AboutSection>

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

const TeamSpeedDial = memo(function TeamSpeedDial({ teamName, onEditClick }: { teamName?: string, onEditClick: () => void }) {
  const { data: user } = useAuth();
  const { data: team } = useTeam(teamName);

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

  if (!team) return;

  const isManager = user?.id === team?.manager;
  const isMember = user?.team?.id === team.id;

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
      {isMember ? <SpeedDial ariaLabel="Team Speed Dial" icon={<SpeedDialIcon></SpeedDialIcon>}>

        {isManager ? <SpeedDialAction icon={<Edit></Edit>} onClick={onEditClick} tooltipTitle="Edit profile"></SpeedDialAction> : null}
        {isManager ? <SpeedDialAction icon={<AddLink></AddLink>} tooltipTitle="Invite member" onClick={handleFetchInvite}></SpeedDialAction> : null}
        <SpeedDialAction icon={<MeetingRoom></MeetingRoom>} tooltipTitle="Leave team" onClick={handleLeaveTeam}></SpeedDialAction>
        {isManager ? <SpeedDialAction icon={<DeleteForever></DeleteForever>} tooltipTitle="Delete team"></SpeedDialAction> : null}
      </SpeedDial> : null}
    </>
  )
});

export default TeamProfilePage;
