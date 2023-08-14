import { ThemeProvider } from "@emotion/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import type {} from "@mui/lab/themeAugmentation";
import { Stack, Button, createTheme, Box } from "@mui/material";
import {
  DateCalendar,
  DateCalendarProps,
  PickersDay,
  PickersDayProps,
} from "@mui/x-date-pickers";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import Weekday from "dayjs/plugin/weekday";
import { Form, Formik, useField, useFormikContext } from "formik";
import _ from "lodash";
import { useReducer, useState } from "react";
import { useTournament } from "../..";
import MyDatePicker from "../inputs/datePicker/MyDatePicker";
import { MatchesTable } from "../tournament/matches/table/MatchesTable";
import { useMatches } from "../viewer/home/Home";
import { useParticipations } from "../viewer/tables/MyTable";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import { Popper } from "@mui/base";
import { EventClickArg } from "@fullcalendar/core";

dayjs.extend(Weekday);

const CustomPickersDay = (
  props: PickersDayProps<Dayjs> & { blockedDays: Dayjs[] }
) => {
  const { blockedDays: blocked, ...rest } = props;

  const isBlocked = blocked.some((b) => b.isSame(props.day));

  return (
    <PickersDay
      {...rest}
      selected={isBlocked}
      sx={{
        "&.Mui-selected": {
          background: "red",
          "&:focus": {
            background: "#c00",
          },
        },
        "&:hover": {
          background: "#8e060624",
        },
      }}
    ></PickersDay>
  );
};

const DateBlocker = (
  props: DateCalendarProps<Dayjs> & { name: string; blockedDays: Dayjs[] }
) => {
  const { blockedDays, ...rest } = props;
  const [field, meta] = useField(props.name);
  const { setFieldValue } = useFormikContext();

  return (
    <DateCalendar
      {...rest}
      value={null}
      disablePast
      disableHighlightToday
      onChange={(date: Dayjs) => {
        if (field.value.some((d: Dayjs) => d.isSame(date))) {
          setFieldValue(
            field.name,
            meta.value.filter((d: Dayjs) => !d.isSame(date))
          );
        } else {
          setFieldValue(field.name, [...meta.value, date]);
        }
      }}
      slots={{
        day: CustomPickersDay,
      }}
      slotProps={{
        day: {
          blockedDays,
        } as PickersDayProps<Dayjs> & { blockedDays: Dayjs[] },
      }}
    ></DateCalendar>
  );
};

function AdminPanel() {
  const { data: unscheduledMatches, status: unscheduledStatus } = useMatches({
    status: "unscheduled",
  });

  const { data: scheduledMatches, status: scheduledStatus } = useMatches({
    status: "scheduled",
  });

  const scheduleMatch = useMutation({
    mutationFn: async (values: { id: string; date: Date }) => {
      console.log(values);
      const res = await axios.patch(`/api/matches/${values.id}`, values);
      return res.data;
    },
  });

  const { data: tournament } = useTournament("current");
  const { data: participants } = useParticipations();
  const [teamAnchorEl, setTeamAnchorEl] = useState(null);
  const isTeamPopperOpen = !!teamAnchorEl;

  if (unscheduledStatus !== "success" || scheduledStatus !== "success")
    return <div>Loading...</div>;

  const scheduled = scheduledMatches.map((m: any) => {
    return {
      //FIXME: type
      start: dayjs(m.date).toDate(),
      end: dayjs(m.date).add(6, "minute").toDate(),
      title: "Match",
    };
  });

  const nextMonday = dayjs().day(8);

  const handleSubmitScheduleMatches = (
    start: Dayjs,
    adminBlocked: Dayjs[],
    matches: any[]
  ) => {
    const byRound = _.groupBy(matches, (m) => {
      const round = tournament?.rounds.find((r: any) => r.id === m.round);
      return round.number;
    });
    const matchesByRound = Object.values(byRound);

    let day = start.subtract(1, "day");
    let round = 0;

    // console.log(queue)

    while (round < matchesByRound.length) {
      day = day.add(1, "day");

      if (day.day() === 0 || day.day() === 6) continue;
      if (adminBlocked.some((b) => b.isSame(day, "day"))) continue;

      //check if it's blocked by teams

      for (const m of matchesByRound[round]) {
        const opponents = participants.filter(
          (p: any) => p.id === m.opponent1.id || p.id === m.opponent2.id
        );

        let blocked = false;
        opponents.forEach((o: any) => {
          if (o.blocked?.some((b: any) => b.isSame(day, "day"))) {
            blocked = true;
          }
        });

        if (blocked) {
          matchesByRound[round + 1] =
            round + 1 < matchesByRound.length ? matchesByRound[round + 1] : [];
          matchesByRound[round + 1].unshift(m);
          continue;
        }

        scheduleMatch.mutate({ ...m, date: day.toDate() });
      }

      round++;
    }
  };

  const handleEventClick = (info: EventClickArg) => {
    setTeamAnchorEl(info.el);
  }

  return (
    <div>
      <MatchesTable matches={unscheduledMatches}></MatchesTable>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "dayGridWeek,dayGridDay",
        }}
        displayEventTime
        initialView="dayGridWeek"
        events={scheduled}
        eventClick={handleEventClick}
        editable
        noEventsText="No matches scheduled for this week."
      ></FullCalendar>
      <Popper open={isTeamPopperOpen} anchorEl={teamAnchorEl}>
        <Box>Test popper</Box>
      </Popper>
      <Formik
        initialValues={{
          start: nextMonday,
          blocked: [] as Dayjs[],
        }}
        onSubmit={(values) =>
          handleSubmitScheduleMatches(
            values.start,
            values.blocked,
            unscheduledMatches
          )
        }
      >
        {({ values }) => (
          <>
            <Form>
              <MyDatePicker
                disablePast
                name="start"
                label="start"
              ></MyDatePicker>
              {/* TODO: TIME PICKER, weekend block checkbox */}

              <DateBlocker
                name="blocked"
                blockedDays={values.blocked}
                minDate={values.start}
              ></DateBlocker>
              <Button type="submit">
                Automatically schedule group stage matches
              </Button>
            </Form>
          </>
        )}
      </Formik>
    </div>
  );
}

//TODO: time-blocking for teams

export default AdminPanel;
