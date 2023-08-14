import { EventClickArg } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ClickAwayListener, Popper, selectClasses } from "@mui/base";
import { Box, Paper, Typography } from "@mui/material";
import dayjs from "dayjs";
import { memo, useCallback, useMemo, useState } from "react";
import { useMatches } from "../../../viewer/home/Home";
import { useTournament } from "../../../..";
import {
  getGroupFromTournament,
  getRoundFromTournament,
  getStageFromTournament,
  useRound,
} from "../../helpers";

function MatchesCalendar() {
  const { data: scheduledMatches, status: scheduledStatus } = useMatches({
    status: "scheduled",
  });

  const { data: tournament } = useTournament("current");

  const events = useMemo(
    () =>
      scheduledMatches?.map((m) => {
        return {
          //FIXME: type
          title: "Match",
          start: dayjs(m.date).toDate(),
          end: dayjs(m.date).add(6, "minute").toDate(),
          opponent1: m.opponent1.id,
          opponent2: m.opponent2.id,
          group: getGroupFromTournament(tournament, m.group),
          stage: getStageFromTournament(tournament, m.stage),
          round: getRoundFromTournament(tournament, m.round),
        };
      }),
    [scheduledMatches, tournament]
  );

  const [match, setMatch] = useState({
    //selected by user
    event: null,
    anchorEl: null,
  });
  const [popperOpen, setPopperOpen] = useState(false);

  const handleEventClick = useCallback((info: EventClickArg) => {
    const { extendedProps, ...rest } = info.event.toPlainObject();
    const event = { ...extendedProps, ...rest };

    setMatch({ event, anchorEl: info.el });
    setPopperOpen(true);
  }, []);

  if (scheduledStatus !== "success") return <div>Loading</div>;

  const { event, anchorEl } = match;

  return (
    <>
      <Popper open={popperOpen} anchorEl={anchorEl}>
        <ClickAwayListener onClickAway={() => setPopperOpen(false)}>
          <Paper>
            <Typography>{`${event?.title}: ${event?.start} - ${event?.end}`}</Typography>
            <Typography>{event?.opponent1}</Typography>
            <Typography>{event?.opponent2}</Typography>
          </Paper>
        </ClickAwayListener>
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
