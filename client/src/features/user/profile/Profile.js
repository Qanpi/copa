import Timeline from "@mui/lab/Timeline/Timeline.js";
import TimelineConnector from "@mui/lab/TimelineConnector/TimelineConnector.js";
import TimelineContent from "@mui/lab/TimelineContent/TimelineContent.js";
import TimelineDot from "@mui/lab/TimelineDot/TimelineDot.js";
import TimelineItem from "@mui/lab/TimelineItem/TimelineItem.js";
import TimelineSeparator from "@mui/lab/TimelineSeparator/TimelineSeparator.js";
import { Avatar } from "@mui/material";
import { useParams } from "react-router";
import { useUser } from "../hooks.ts";
import "./Profile.css";

function ProfilePage() {
  const {id} = useParams();
  const {status: userStatus, data: user} = useUser(id);

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
