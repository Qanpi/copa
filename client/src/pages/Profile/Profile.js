import { useContext } from "react";
import "./Profile.css";
import { AuthContext } from "../..";
import { Avatar } from "@mui/material";
import TimelineContent from "@mui/lab/TimelineContent/TimelineContent";
import TimelineItem from "@mui/lab/TimelineItem/TimelineItem";
import Timeline from "@mui/lab/Timeline/Timeline"
import TimelineDot from "@mui/lab/TimelineDot/TimelineDot"
import TimelineConnector from "@mui/lab/TimelineConnector/TimelineConnector"
import TimelineSeparator from "@mui/lab/TimelineSeparator/TimelineSeparator"

function ProfilePage() {
  const [userStatus, user] = useCurrentUser();

  return (
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
  );
}

export default ProfilePage;
