import Timeline from "@mui/lab/Timeline/Timeline.js";
import TimelineConnector from "@mui/lab/TimelineConnector/TimelineConnector.js";
import TimelineContent from "@mui/lab/TimelineContent/TimelineContent.js";
import TimelineDot from "@mui/lab/TimelineDot/TimelineDot.js";
import TimelineItem from "@mui/lab/TimelineItem/TimelineItem.js";
import TimelineSeparator from "@mui/lab/TimelineSeparator/TimelineSeparator.js";
import {FormControlLabel, Avatar, Box, Container, Stack, Switch, Typography } from "@mui/material";
import { useParams } from "react-router";
import { useUser } from "./hooks.ts";
import { LoadingBackdrop } from "../viewer/header.tsx";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

function ProfilePage() {
  const { id } = useParams();
  const { status: userStatus, data: user } = useUser(id);
  console.log(user)

  if (!user) return <LoadingBackdrop></LoadingBackdrop>

  if (userStatus === "error") return <>not publicly available</>

  return <Container maxWidth="lg" sx={{ display: "flex", justifyContent: "center", alignItems: "center", pt: 10 }}>
    <Stack direction="column" spacing={5}>
      <Stack direction="row" spacing={3} alignItems={"center"}>
        <Avatar src={user.avatar} sx={{ width: 150, height: 150 }}></Avatar>
        <Box>
          <Typography variant="h2" sx={{mb: -1}}>{user.name}</Typography>
          <Typography variant="h5" sx={{mb: 2}}>
            <Link to={`/teams/${user.team?.name}`}>
              {user.team?.name}
            </Link>
          </Typography>
          <Typography>Joined {dayjs().to(user.createdAt)}.</Typography>
        </Box>
      </Stack>
      <Box>
        <Typography>Settings</Typography>
        <FormControlLabel control={<Switch></Switch>} label={"Publish profile"}></FormControlLabel>
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
        <Timeline>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>Eat</TimelineContent>
          </TimelineItem>
        </Timeline>
      </div>
    </>
  ) : <div>Loading..</div>;
}

export default ProfilePage;
