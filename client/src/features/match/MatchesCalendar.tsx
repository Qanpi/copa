import {
  EventApi,
  EventClickArg,
  EventDropArg,
  EventInput
} from "@fullcalendar/core";
import interactionPlugin, {
  EventResizeDoneArg,
} from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { ClickAwayListener, Popper } from "@mui/base";
import { Paper, Typography } from "@mui/material";
import dayjs from "dayjs";
import { ObjectId } from "mongodb";
import {
  useCallback,
  useMemo,
  useState
} from "react";
import "react-dragula/dist/dragula.css";
import { useParticipant } from "../participant/hooks.ts";
import { useMatches, useUpdateMatch } from "./hooks.ts";
import "./MatchesCalendar.css";

import { TMatch } from "@backend/models/match.ts";
import { Link, useNavigate } from "react-router-dom";
import { useTournament } from "../tournament/hooks.ts";

function MatchesCalendar() {
  const { data: tournament } = useTournament("current");
  const { data: scheduledMatches } = useMatches(tournament?.id,
    {
      scheduled: "true",
    });

  const updateMatch = useUpdateMatch();

  const events: EventInput[] = useMemo(
    () => scheduledMatches?.map((m, i) => {
      return {
        //FIXME: type
        id: m.id,
        title: `${m.opponent1?.name} vs ${m.opponent2?.name}`,
        start: dayjs(m.start).toDate(),
        end: dayjs(m.end).toDate(),
        // opponent1: m.opponent1?.id,
        // opponent2: m.opponent2?.id,
        // group: m.group_id,
        // stage: m.stage_id,
        // round: m.round_id,
      };
    }) || [],
    [scheduledMatches]
  );

  const [match, setMatch] = useState({
    //selected by user
    event: null,
    anchorEl: null,
  });
  const [popperOpen, setPopperOpen] = useState(false);

  const navigate = useNavigate();
  const handleEventClick = useCallback((info: EventClickArg) => {
    const { extendedProps, ...rest } = info.event.toPlainObject();
    const event = { ...extendedProps, ...rest };

    return navigate(`/tournament/matches/${event.id}`);
    // setMatch({ event, anchorEl: info.el });
    // setPopperOpen(true);
  }, []);

  const handleEventResize = (info: EventResizeDoneArg) => {
    const { event } = info;

    const duration = dayjs(event.end).diff(event.start, "minutes");
    updateMatch.mutate({ id: event.id, duration });
  };

  const handleEventDrop = (info: EventDropArg) => {
    const { event } = info;

    updateMatch.mutate({ id: event.id, start: event.start });
  };

  return (
    <>
      <Popper open={popperOpen} anchorEl={match.anchorEl}>
        <ClickAwayListener onClickAway={() => setPopperOpen(false)}>
          <div>
            <MatchEventPopper {...match.event}></MatchEventPopper>
          </div>
        </ClickAwayListener>
      </Popper>

      <FullCalendar
        plugins={[listPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "listWeek,timeGridDay",
        }}
        displayEventTime
        initialView="listWeek"
        views={{
          timeGridDay: {
            allDaySlot: false,
          },
        }}
        events={events}
        eventClick={handleEventClick}
        // eventDrop={handleEventDrop}
        // TODO: allow admin to modify these
        slotMinTime={"10:00:00"}
        slotMaxTime={"15:00:00"}
        scrollTime={"12:00:00"}
        nowIndicator
        // snapDuration={1}
        expandRows
        // eventResize={handleEventResize}
        // editable
        noEventsText="No matches scheduled for this week."
      ></FullCalendar>
    </>
  );
}

const MatchEventPopper = ({
  title,
  start,
  end,
  opponent1,
  opponent2,
  id,
}: MatchEvent) => {
  const { data: opp1 } = useParticipant(opponent1);
  const { data: opp2 } = useParticipant(opponent2);

  return (
    <Paper>
      <Typography>{`${title}: ${start} - ${end}`}</Typography>
      <Link to={`/tournament/matches/${id}`}>Match link</Link>
      <Typography>{opp1?.name}</Typography>
      <Typography>{opp2?.name}</Typography>
    </Paper>
  );
};

export default MatchesCalendar;
