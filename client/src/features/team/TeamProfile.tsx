import { TTeam } from "@backend/models/team.ts";
import { AddLink, Clear, ContentCopy, DeleteForever, Edit, MeetingRoom, Save, VisibilityOff } from "@mui/icons-material";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
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
  Typography
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { Form, Formik, useField } from "formik";
import { memo, useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as Yup from "yup";
import MyTextField from "../inputs/myTextField.tsx";
import DevFeature from "../layout/DevelopmentFeature.tsx";
import { FeedbackSnackbar } from "../layout/FeedbackSnackbar.tsx";
import NotFoundPage from "../layout/NotFoundPage.tsx";
import OutlinedContainer from "../layout/OutlinedContainer.tsx";
import { TFeedback } from "../types.ts";
import { useAuth, useTeamMembers } from "../user/hooks.ts";
import GradientTitle from "../viewer/gradientTitle.tsx";
import { useTournament } from "../viewer/hooks.ts";
import { TeamBannerInput, teamValidationSchema } from "./CreateTeam.tsx";
import { useDeleteTeam, useParticipations, useRemoveUserFromTeam, useTeam, useUpdateTeam } from "./hooks.ts";
import { useParticipants } from "../participant/hooks.ts";

dayjs.extend(relativeTime);

function TeamProfilePage() {
  //FIXME: think about encoding and decoding practices
  const { name } = useParams();
  const encoded = name ? encodeURIComponent(name) : undefined;
  const { data: team, status: teamStatus, isLoading } = useTeam(encoded);

  const [selectedTab, setSelectedTab] = useState(0);
  const handleChangeSelectedTab = useCallback((_: any, newTab: number) => {
    setSelectedTab(newTab);
  }, [])

  const [feedback, setFeedback] = useState<TFeedback>({});

  const updateTeam = useUpdateTeam();
  const [editMode, setEditMode] = useState(false);
  const handleEditClick = useCallback(
    () => {
      setSelectedTab(0);
      setEditMode(m => !m);
    }
    , [])

  const handleSubmit = (values: TTeam) => {
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

  if (!isLoading && !team) return <NotFoundPage></NotFoundPage>

  return (
    <Formik enableReinitialize validationSchema={Yup.object(teamValidationSchema)} initialValues={team || {} as TTeam} onSubmit={handleSubmit}>
      {
        ({ values: team, dirty, submitForm, resetForm }) => {
          return (
            <Form>
              <FeedbackSnackbar feedback={feedback} onClose={() => setFeedback({})}></FeedbackSnackbar>
              <Box sx={{ pt: 15 }} display="flex" flexDirection={"column"} height={"100%"}>
                <GradientTitle justifyContent={"left"} paddingLeft={"5vw"} sx={{ mb: 0 }}>
                  <Box sx={{ width: "30vw", height: "300px", maxWidth: "300px", maxHeight: "300px", position: "absolute" }}>
                    {isLoading ? <Skeleton variant="circular" sx={{ height: "100%" }}></Skeleton> :
                      <TeamBannerInput name={"bannerUrl"} edit={editMode} sx={{ width: "100%", height: "100%" }}></TeamBannerInput>}
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
                  {selectedTab === 1 ? <TimelineTab teamName={team?.name}></TimelineTab> : null}
                  {selectedTab === 2 ? <DevFeature></DevFeature> : null}
                </Container>
              </Box>
              <Box sx={{ position: "fixed", bottom: 30, right: 30 }}>
                {editMode ? <SpeedDial ariaLabel="Save updates" icon={<IconButton onClick={submitForm} size="large"><Save ></Save></IconButton>}>
                  {/* fixme: cancel functionality for mobile */}
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

const TabBar = memo(function TabBar({ selected, onChange, teamId }: { selected: number, onChange: TabsProps["onChange"], teamId?: string }) {
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

const TimelineTab = ({ teamName }: { teamName?: string }) => {
  const { data: team, isLoading } = useTeam(teamName);
  const { data: participations } = useParticipations(team?.id);

  return (
    <Box sx={{ display: "flex", alignItems: "end" }}>
      <Timeline position="left">
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot></TimelineDot>
            <TimelineConnector></TimelineConnector>
          </TimelineSeparator>
          <TimelineContent>What's next?</TimelineContent>
        </TimelineItem>
        <DevFeature></DevFeature>
        {participations?.map(p => {
          return (
            <TimelineItem>
              <TimelineOppositeContent color="text.secondary">{!team?.createdAt ? "" : dayjs(team.createdAt).format("DD.MM.YYYY")}</TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot />
              </TimelineSeparator>
              <TimelineContent>{ }</TimelineContent>
            </TimelineItem>
          )
        })}
        <TimelineItem>
          <TimelineOppositeContent color="text.secondary">{!team?.createdAt ? "" : dayjs(team.createdAt).format("DD.MM.YYYY")}</TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot />
          </TimelineSeparator>
          <TimelineContent>Established</TimelineContent>
        </TimelineItem>
      </Timeline>
    </Box >
  );
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
  const { data: tournament } = useTournament("current");
  const { data: members } = useTeamMembers(team?.id);
  const { data: participants, isInitialLoading } = useParticipants(tournament?.id, {
    team: team?.id,
  })
  const isParticipant = !!participants?.[0];

  const isManager = user?.id === team?.manager;

  return (
    <Stack direction="column" spacing={4}>
      {!isParticipant ? (isManager && tournament?.registration?.isOpen ? <Alert severity={"info"}>
        <AlertTitle>Register!</AlertTitle>
        Don't miss your chance to <Link style={{ textDecoration: "underline" }} to="/tournament/register">register</Link> for {tournament.name}!
      </Alert> : null) :
        <Alert>
          <AlertTitle>Congratulations!</AlertTitle>
          Your team is registered for {tournament?.name || ""}!
        </Alert>
      } 
      {/* <Skeleton variant="rectangular" sx={{ width: "100%", height: "20px" }}></Skeleton>} */}
      <AboutSection open={team?.about !== "" || editMode} name="about" edit={editMode}></AboutSection>

      {
        members && members.length > 0 ? <OutlinedContainer>
          <Typography variant="h6" color="primary">Squad</Typography>
          <Box sx={{ display: "grid", gap: 3, p: 3, gridTemplateColumns: "repeat(auto-fill, 100px)", gridTemplateRows: "repeat(auto-fill, 120px)" }}>
            {members?.map(m => {
              const visible = m?.preferences?.publicProfile;

              return (
                <Box sx={{ alignItems: "center", flexDirection: "column" }} display="flex">
                  <Box key={m.id} display="flex" alignItems="center" justifyContent={"center"}>
                    <Avatar sx={{ width: "100px", height: "100px", opacity: visible ? 1 : 0.5 }} src={m.avatar} ></Avatar>
                    {visible ? null : <Tooltip enterTouchDelay={0} arrow title={m.id === user?.id ? "Your profile is only visible to your team members by default. You can change this option on your profile page." : ""}>
                      <VisibilityOff sx={{ position: "absolute" }}></VisibilityOff>
                    </Tooltip>}
                  </Box>
                  <Typography>{m.name}</Typography>
                </Box>
              )
            }
            )}
          </Box>
        </OutlinedContainer> : null
      }
    </Stack >
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

  type TInvite = {
    link?: string,
    countdown?: string
  }

  const [invite, setInvite] = useState<TInvite>({} as TInvite);


  const handleFetchInvite = () => {
    if (!team) return;

    fetchInvite.mutate(team, {
      onSuccess: (data) => {
        setInvite(data);
      }
    })
  }

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(invite.link || "");
    setInvite({})
  };

  const removeUserFromTeam = useRemoveUserFromTeam();
  const deleteTeam = useDeleteTeam();



  if (!team) return;

  const handleLeaveTeam = () => {
    if (!user) return;
    removeUserFromTeam.mutate({ userId: user.id, teamId: team.id });
  };

  const handleDeleteTeam = () => {
    deleteTeam.mutate(team);
  }

  const isManager = user?.id === team?.manager;
  const isMember = user?.team?.id === team.id;

  return (
    <>
      <Dialog open={!!invite?.link}>
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

        {isManager ? <SpeedDialAction tooltipOpen icon={<Edit></Edit>} onClick={onEditClick} tooltipTitle="Edit"></SpeedDialAction> : null}
        {isManager ? <SpeedDialAction tooltipOpen icon={<AddLink></AddLink>} tooltipTitle="Invite" onClick={handleFetchInvite}></SpeedDialAction> : null}
        <SpeedDialAction tooltipOpen icon={<MeetingRoom></MeetingRoom>} tooltipTitle="Leave" onClick={handleLeaveTeam}></SpeedDialAction>
        {isManager ? <SpeedDialAction tooltipOpen icon={<DeleteForever></DeleteForever>} onClick={handleDeleteTeam} tooltipTitle="Delete"></SpeedDialAction> : null}
      </SpeedDial> : null}
    </>
  )
});

export default TeamProfilePage;
