import Timeline from "@mui/lab/Timeline/Timeline.js";
import TimelineConnector from "@mui/lab/TimelineConnector/TimelineConnector.js";
import TimelineContent from "@mui/lab/TimelineContent/TimelineContent.js";
import TimelineDot from "@mui/lab/TimelineDot/TimelineDot.js";
import TimelineItem from "@mui/lab/TimelineItem/TimelineItem.js";
import TimelineSeparator from "@mui/lab/TimelineSeparator/TimelineSeparator.js";
import { FormControlLabel, Avatar, Box, Container, Stack, Switch, Typography, Tooltip, Tabs, Tab, Button } from "@mui/material";
import { useParams } from "react-router";
import { useUpdateUser, useUser, userKeys } from "./hooks.ts";
import { LoadingBackdrop } from "../viewer/header.tsx";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import OutlinedContainer from "../layout/OutlinedContainer.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { PromptContainer } from "../layout/PromptContainer.tsx";
import { Form, Formik } from "formik";
import { useState } from "react";
import * as Yup from "yup"
import { TUser } from "@backend/models/user.ts";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";

function ProfilePage() {
  const { id } = useParams();
  const { status: userStatus, data: user, error } = useUser(id);

  const [selectedTab, setSelectedTab] = useState(0);

  if (!user) return <LoadingBackdrop open={true}></LoadingBackdrop>

  if (user === "private") return <PromptContainer>
    <Typography>This profile is private</Typography>
  </PromptContainer>

  const handleChangeSelectedTab = (_, newTab: number) => {
    setSelectedTab(newTab);
  }

  return <Container maxWidth="lg" sx={{ display: "flex", justifyContent: "center", alignItems: "center", pt: 10 }}>
    <Stack direction="column" spacing={5}>
      <Stack direction="row" spacing={3} alignItems={"center"}>
        <Avatar src={user.avatar} sx={{ width: 150, height: 150 }}></Avatar>
        <Box>
          <Typography variant="h2" sx={{ mb: 0 }}>{user.name}</Typography>
          <Typography variant="h5" >
            <Link to={`/teams/${user.team?.name}`}>
              {user.team?.name}
            </Link>
          </Typography>
        </Box>
      </Stack>
      <Box>
        <Tabs value={selectedTab} onChange={handleChangeSelectedTab} sx={{ mb: 5 }}>
          <Tab label="Timeline"></Tab>
          <Tab label="Preferences"></Tab>
        </Tabs>

        <OutlinedContainer>
          {selectedTab === 0 ? <TimelineTab user={user}></TimelineTab> : null}
          {selectedTab === 1 ? <PreferencesTab user={user}></PreferencesTab> : null}
        </OutlinedContainer>
      </Box>
    </Stack>
  </Container>

  return user ? (
    <>
      <div className="profile">
        <Avatar
          src={user.image}
          alt={user.name}
          sx={{ width: 100, height: 100 }}
        />
        <div className="no-margin username">
          <h1>{user.name}</h1>
          <p>{user.name}</p>
        </div>
      </div>
      <div className="timeline">
        <h3>Timeline</h3>
      </div>
    </>
  ) : <div>Loading..</div>;
}

const TimelineTab = ({ user }: { user: TUser }) => {
  return (
    <Box sx={{ minHeight: "50vh", display: "flex", alignItems: "end" }}>
      <Timeline position="left">
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot></TimelineDot>
            <TimelineConnector></TimelineConnector>
          </TimelineSeparator>
          <TimelineContent>What's next?</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineOppositeContent color="text.secondary">{dayjs(user.createdAt).format("DD.MM.YYYY")}</TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot />
          </TimelineSeparator>
          <TimelineContent>Joined</TimelineContent>
        </TimelineItem>
      </Timeline>
    </Box>
  );
}

type TUserAny = {
  [key in keyof TUser]?: any
}

const userValidationSchema: TUserAny = {
  name: Yup.string().trim().max(20).required(),
  preferences: {
    publicProfile: Yup.bool(),
  }
}

const PreferencesTab = ({ user }: { user: TUser }) => {
  const updateUser = useUpdateUser();

  const handleUpdatePreferences = (values: TUser) => {
    updateUser.mutate(values);
  }

  return (
    <Formik initialValues={user} validationSchema={userValidationSchema}>
      <Form>
        {

          <Stack direction="column" sx={{ minHeight: "400px" }}>
            <Tooltip title="Make profile publicly accessible to anyone" arrow>
              <FormControlLabel control={<Switch></Switch>} label={"Publish profile"}></FormControlLabel>
            </Tooltip>
            <Button type="submit" sx={{ mt: "auto", width: "30%" }}>Save</Button>
          </Stack>
        }
      </Form>
    </Formik>
  )
}

export default ProfilePage;
