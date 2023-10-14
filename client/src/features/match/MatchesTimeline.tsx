import Timeline, { TimelineItemBase } from "react-calendar-timeline"
import 'react-calendar-timeline/lib/Timeline.css'

import { useTournament } from "../viewer/hooks";
import { useMatches, useUpdateMatch } from "./hooks";
import dayjs from "dayjs";

function MatchesTimeline() {
    const { data: tournament } = useTournament("current");
    const { data: scheduledMatches, status: scheduledStatus } = useMatches(tournament?.id,
        {
            scheduled: true,
        });

    const updateMatch = useUpdateMatch();

    const groups = [{
        id: 1,
        title: "group 1",
    }]

    const items: TimelineItemBase<Date>[] = scheduledMatches?.map(m => ({
        id: m.id,
        group: 1,
        title: `${m.opponent1.name || "name"}`,
        start_time: new Date(m.start),
        end_time: dayjs(m.start).add(m.duration, "minutes").toDate()
    }))

    if (!items) return <>loading...</>;

    return (
        <Timeline items={items}
            groups={groups}
            dragSnap={1 * 60 * 1000}
            defaultTimeStart={dayjs().subtract(12, "hour").toDate()}
            defaultTimeEnd={dayjs().add(12, "hour").toDate()}>
        </Timeline>
    )
}

export default MatchesTimeline;