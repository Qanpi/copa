import Timeline from "@mui/lab/Timeline/Timeline.js";
import TimelineConnector from "@mui/lab/TimelineConnector/TimelineConnector.js";
import TimelineContent from "@mui/lab/TimelineContent/TimelineContent.js";
import TimelineDot from "@mui/lab/TimelineDot/TimelineDot.js";
import TimelineItem from "@mui/lab/TimelineItem/TimelineItem.js";
import TimelineSeparator from "@mui/lab/TimelineSeparator/TimelineSeparator.js";
import { FormControlLabel, Avatar, Box, Container, Stack, Switch, Typography, Tooltip, Tabs, Tab, Button, IconButton, InputLabel } from "@mui/material";
import { useParams } from "react-router";
import { useUpdateUser, useUser, userKeys } from "./hooks.ts";
import { LoadingBackdrop } from "../layout/LoadingBackdrop.tsx";
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
import NotFoundPage from "../layout/NotFoundPage.tsx";
import { Edit, Help, QuestionMark, QuestionMarkRounded } from "@mui/icons-material";
import MyTextField from "../inputs/myTextField.tsx";

function ProfilePage() {
  const { id } = useParams();
  const { status: userStatus, data: user, error } = useUser(id);

  const [selectedTab, setSelectedTab] = useState(0);

  if (!user) return <LoadingBackdrop open={true}></LoadingBackdrop>

  if (user === "private") return <NotFoundPage></NotFoundPage>;

  const handleChangeSelectedTab = (_, newTab: number) => {
    setSelectedTab(newTab);
  }

  return <Container maxWidth="md" sx={{ display: "flex", justifyContent: "center", alignItems: "center", pt: 10 }}>
    <Stack direction="column" spacing={5}>
      <Stack direction="row" spacing={3} alignItems={"center"}>
        <Avatar src={user.avatar} sx={{ width: 150, height: 150 }}></Avatar>
        <Box>
          <Typography variant="h2" sx={{ mb: 1 }}>{user.name}</Typography>
          <Typography variant="h5" sx={{ ml: "3px" }}>
            {user.team ? <Link to={`/teams/${encodeURIComponent(user.team.name)}`}>
              {user.team.name}
            </Link> : null}
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
    <Box sx={{ display: "flex", alignItems: "end" }}>
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
  nickname: Yup.string().trim().max(20).optional(),
  preferences: Yup.object({
    publicProfile: Yup.bool().required()
  })
}

const PreferencesTab = ({ user }: { user: TUser }) => {
  const updateUser = useUpdateUser();

  const handleUpdatePreferences = (values: TUser) => {
    updateUser.mutate(values);
  }

  return (
    <Formik initialValues={user} validationSchema={Yup.object(userValidationSchema)} onSubmit={handleUpdatePreferences}>
      {({ setFieldValue, values }) => {
        return (
          <Form>
            <Stack direction="column" spacing={2}>
              <Box>
                <InputLabel>Real name
                  <Tooltip arrow enterTouchDelay={0} title="This name will be visible only to the admin. Please set it to your real name.">
                    <Help sx={{ml: 1}} fontSize="10px"></Help>
                  </Tooltip>
                </InputLabel>
                <MyTextField name="name"></MyTextField>
              </Box>
              <Box>
                <InputLabel>Display name
                  <Tooltip arrow enterTouchDelay={0} title="This name will be visible to everyone else. You can keep it blank to use your real name.">
                    <Help sx={{ml: 1}} fontSize="10px"></Help>
                  </Tooltip>
                </InputLabel>
                <MyTextField name="nickname"></MyTextField>
              </Box>
              <Tooltip enterTouchDelay={0} title="Make profile publicly accessible to anyone" arrow>
                <FormControlLabel value={"on"} onChange={(_, v) => setFieldValue("preferences.publicProfile", v)} control={<Switch checked={values.preferences?.publicProfile}></Switch>} label={"Publish profile"}></FormControlLabel>
              </Tooltip>
              <Button type="submit" sx={{ mt: "auto", width: "30%" }}>Save</Button>
            </Stack>
          </Form>
        )
      }
      }
    </Formik>
  )
}

export default ProfilePage;
