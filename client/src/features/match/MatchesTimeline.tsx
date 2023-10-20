import Timeline, { OnItemDragObjectBase, TimelineItemBase } from "react-calendar-timeline"
import 'react-calendar-timeline/lib/Timeline.css'
import './MatchesTimeline.css'

import { useDivisions, useTournament } from "../viewer/hooks";
import { useMatches, useUpdateMatch } from "./hooks";
import dayjs from "dayjs";
import { useGroups } from "../group/hooks";
import { useStages } from "../stage/hooks";
import { Select, Box } from "@mui/material";

function MatchesTimeline() {
    const { data: tournament } = useTournament("current");
    const { data: scheduledMatches, status: scheduledStatus } = useMatches(tournament?.id,
        {
            scheduled: "true",
        });

    console.log(scheduledMatches)

    //FIXME: trypes
    const items: TimelineItemBase<Date>[] | undefined = scheduledMatches?.map(m => ({
        id: m.id,
        group: m.group_id,
        start_time: new Date(m.start),
        end_time: new Date(m.end),
        // end_time: dayjs(m.start).add(m.duration, "minutes").toDate(),
        canChangeGroup: false,
    }))

    const updateMatch = useUpdateMatch();

    const { data: divisions } = useDivisions(tournament?.id);
    const { data: stages } = useStages(tournament?.id);
    const { data: groupings } = useGroups(tournament?.id);

    const groups = groupings?.map(g => {
        const stage = stages?.find(s => s.id === g.stage_id);
        const division = divisions.find(d => d.id === stage?.division);

        return {
            id: g.id,
            title: `${division?.name} ${g.name}`
        }
    })

    if (!items || !groups) return <>loading...</>;

    const handleItemDrag = ({ eventType, itemId, time }: OnItemDragObjectBase) => {
        console.log(eventType, itemId, time)

        const datetime = new Date(time);
        const match = scheduledMatches?.find(m => m.id === itemId);
        if (!match) throw new Error("Match not found")

        if (eventType === "move") {
            const duration = dayjs(match.end).diff(match.start, "seconds");
            console.log(duration)

            updateMatch.mutate({
                id: itemId,
                start: datetime,
                end: dayjs(datetime).add(duration, "seconds").toDate()
            })
        } else if (eventType === "resize") {
            updateMatch.mutate({
                id: itemId,
                end: datetime,
            })
        }
    }

    return (
        <Box>
            <Select label="Group by"></Select>
            <Timeline items={items}
                groups={groups}
                dragSnap={1 * 60 * 1000}
                defaultTimeStart={dayjs().subtract(12, "hour").toDate()}
                defaultTimeEnd={dayjs().add(12, "hour").toDate()}
                onItemDrag={handleItemDrag}
            >
            </Timeline>
        </Box>
    )
}

export default MatchesTimeline;