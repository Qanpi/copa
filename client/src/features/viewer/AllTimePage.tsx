import Timeline from "@mui/lab/Timeline";
import BannerPage from "./BannerPage";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import DevFeature from "../layout/DevelopmentFeature";

function HallOfFame() {
    return <BannerPage title="Hall Of Fame">
        <DevFeature></DevFeature>
        <Timeline>
            <TimelineItem>
                <TimelineSeparator>
                    <TimelineDot />
                    <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent></TimelineContent>
            </TimelineItem>
        </Timeline>
    </BannerPage>
}

export default HallOfFame;