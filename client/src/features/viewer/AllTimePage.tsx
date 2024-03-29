import Timeline from "@mui/lab/Timeline";
import BannerPage from "./BannerPage";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import { useTournament } from "../tournament/hooks";
import { useTeam } from "../team/hooks";
import { ObjectId } from "mongoose";
import { Stack, Box, Typography, Skeleton } from "@mui/material";
import dayjs from "dayjs";
import { repeat } from "lodash-es";
import "./AllTimePage.css"

type TWinnerTimelineItem = {
    teamName?: string,
    tournamentId?: string,
    picture?: string
}

const WinnerTimelineItem = ({ teamName, tournamentId, picture }: TWinnerTimelineItem) => {
    const { data: tournament, status: tournamentStatus, isLoading: isTournamentLoading } = useTournament(tournamentId);
    const { data: team, status: teamStatus, isLoading: isTeamLoading } = useTeam(teamName);

    return (
        <TimelineItem sx={{ alignItems: "center", pt: 10, pb: 10 }}>
            <Box sx={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                opacity: "0.2",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: -1,
                overflow: "hidden"
            }} className="box-shadow">
                <Box component="img" alt="team banner" height="100%" src="https://i.imgur.com/0beHLTA.png"></Box>
            </Box>
            <TimelineOppositeContent sx={{ pl: 4 }}>
                {isTournamentLoading ? <Skeleton height="10em" width="20em"></Skeleton> :
                    <>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: -1, md: 2 }} alignItems={"baseline"}>
                            <Typography variant="h3" fontWeight={600}>{tournament.name}</Typography>
                            <Typography variant="h6" color="primary">{dayjs(tournament.start).year()}</Typography>
                        </Stack>
                        <Box component="div" dangerouslySetInnerHTML={{ __html: tournament.summary }}>
                        </Box>
                    </>
                }
            </TimelineOppositeContent>
            <TimelineSeparator>
                {/* don't hardcode color */}
                <TimelineDot sx={{}} />
            </TimelineSeparator>
            <TimelineContent sx={{ display: "flex", alignItems: "end", justifyContent: "right", pr: 4 }}>
                <Box sx={{ position: "relative", width: "30vw", maxWidth: "500px" }}
                    component="img" src="https://i.imgur.com/h1kcv2z.png">
                </Box>
            </TimelineContent>
        </TimelineItem >
    )
}

function HallOfFame() {
    //FIXME: hard-coded for now
    const { data: tournament, isLoading: isTournamentLoading } = useTournament("current")
    const { data: team, isLoading: isTeamLoading } = useTeam("PiPo IF");
    // const { data: team, isLoading: isTeamLoading } = useTeam("bluetooth 56 591");


    const isLoading = isTournamentLoading || isTeamLoading;

    return <BannerPage title="Hall Of Fame">
        <Timeline position="left" sx={{ position: "relative" }}>
            <TimelineConnector sx={{ height: "45%", position: "absolute", right: "calc(50% - 1px)", bottom: "50%" }}></TimelineConnector>
            <WinnerTimelineItem teamName={team?.name} tournamentId={tournament?.id} picture={""}></WinnerTimelineItem>
        </Timeline>
    </BannerPage>
}

export default HallOfFame;