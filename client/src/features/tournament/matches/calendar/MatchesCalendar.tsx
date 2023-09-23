import {
  EventApi,
  EventClickArg,
  EventDropArg,
  EventInput,
  EventSourceInput,
} from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, {
  EventResizeDoneArg,
} from "@fullcalendar/interaction";
import { ClickAwayListener, Popper, selectClasses } from "@mui/base";
import { Box, Paper, Typography } from "@mui/material";
import dayjs from "dayjs";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useMatches } from "../hooks";
import { useTournament } from "../../hooks";
import {
  getGroupFromTournament,
  getRoundFromTournament,
  getStageFromTournament,
  useRound,
} from "../../helpers";
import { ObjectId } from "mongodb";
import { useParticipants, useParticipant } from "../../../participant/hooks";
import Dragula from "react-dragula";
import "react-dragula/dist/dragula.css";
import { useUpdateMatch } from "../hooks";
import { TMatch } from "@backend/models/match";
import "./MatchesCalendar.css"

// type MatchEvent = {
//   matchId: ObjectId;
//   title: string;
//   start: Date;
//   end: Date;
//   opponent1: ObjectId;
//   opponent2: ObjectId;
//   group: ObjectId;
//   stage: ObjectId;
//   round: ObjectId;
// };

type MatchEvent = Omit<
  Partial<TMatch>,
  "opponent1" | "opponent2" | "duration"
> & {
  opponent1: ObjectId;
  opponent2: ObjectId;
} & Partial<EventApi>;

function MatchesCalendar() {
  const { data: scheduledMatches, status: scheduledStatus } = useMatches({
    status: "scheduled",
  });

  const updateMatch = useUpdateMatch();

  const events: MatchEvent[] = useMemo(
    () =>
      scheduledMatches?.map((m, i) => {
        return {
          //FIXME: type
          id: m.id,
          title: `Match ${i}`,
          start: dayjs(m.start).toDate(),
          end: dayjs(m.start).add(m.duration, "minute").toDate(),
          opponent1: m.opponent1.id,
          opponent2: m.opponent2.id,
          group: m.group,
          stage: m.stage,
          round: m.round,
        };
      }),
    [scheduledMatches]
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

  const handleEventResize = (info: EventResizeDoneArg) => {
    const { event } = info;

    const duration = dayjs(event.end).diff(event.start, "minutes");
    updateMatch.mutate({ id: event.id, duration });
  };

  const handleEventDrop = (info: EventDropArg) => {
    const { event } = info;

    updateMatch.mutate({ id: event.id, start: event.start });
  };

  if (scheduledStatus !== "success") return <div>Loading</div>;

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
        eventDrop={handleEventDrop}
        scrollTime={"12:00:00"}
        nowIndicator
        snapDuration={1}
        expandRows
        eventResize={handleEventResize}
        editable
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
      <Typography>{id}</Typography>
      <Typography>{opp1?.name}</Typography>
      <Typography>{opp2?.name}</Typography>
    </Paper>
  );
};

export default MatchesCalendar;
