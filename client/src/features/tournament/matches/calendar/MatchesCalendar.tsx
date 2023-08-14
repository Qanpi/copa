import { EventClickArg } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Popper } from "@mui/base";
import { Box } from "@mui/material";
import dayjs from "dayjs";
import { memo, useCallback, useMemo, useState } from "react";
import { useMatches } from "../../../viewer/home/Home";
import { useTournament } from "../../../..";

function MatchesCalendar() {
  const { data: scheduledMatches, status: scheduledStatus } = useMatches({
    status: "scheduled",
  });

  const tournament = useTournament("current");

  const events = useMemo(() => scheduledMatches?.map((m: any) => {
    return {
      //FIXME: type
      title: "Match",
      start: dayjs(m.date).toDate(),
      end: dayjs(m.date).add(6, "minute").toDate(),
    };
  }), [scheduledMatches]);

  const [teamAnchorEl, setTeamAnchorEl] = useState(null);
  const isTeamPopperOpen = !!teamAnchorEl;

  const handleEventClick = useCallback((info: EventClickArg) => {
    console.log(info)
    setTeamAnchorEl(info.el);
  }, []);

  if (scheduledStatus !== "success") return <div>Loading</div>;

  return (
    <>
      <Popper open={isTeamPopperOpen} anchorEl={teamAnchorEl}>
        <Box>Test popper</Box>
      </Popper>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "dayGridWeek,dayGridDay",
        }}
        displayEventTime
        initialView="dayGridWeek"
        events={events}
        eventClick={handleEventClick}
        editable
        noEventsText="No matches scheduled for this week."
      ></FullCalendar>
    </>
  );
}

export default MatchesCalendar;
