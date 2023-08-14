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
import { ObjectId } from "mongodb";
import { useParticipants, useParticipant } from "../../../participant/hooks";

type MatchEvent = {
  title: string;
  start: Date;
  end: Date;
  opponent1: ObjectId;
  opponent2: ObjectId;
  group: ObjectId;
  stage: ObjectId;
  round: ObjectId;
};

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
          group: m.group,
          stage: m.stage,
          round: m.round,
        } as MatchEvent;
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

  return (
    <>
      <Popper open={popperOpen} anchorEl={match.anchorEl}>
        <ClickAwayListener
          onClickAway={() => setPopperOpen(false)}
        >
          <div>
            <MatchEventPopper {...match.event}></MatchEventPopper>
          </div>
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

const MatchEventPopper = ({title, start, end, opponent1, opponent2}: Partial<MatchEvent>) => {
  const {data: opp1} = useParticipant(opponent1);
  const {data: opp2} = useParticipant(opponent2);

  return (
    <Paper>
      <Typography>{`${title}: ${start} - ${end}`}</Typography>
      <Typography>{opp1?.name}</Typography>
      <Typography>{opp2?.name}</Typography>
    </Paper>
  );
};

export default MatchesCalendar;
