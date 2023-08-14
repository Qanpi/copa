import { ThemeProvider } from "@emotion/react";

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
import { useTournament } from "../../..";
import MyDatePicker from "../../inputs/datePicker/MyDatePicker";
import { MatchesTable } from "./table/MatchesTable";
import { useMatches } from "../../viewer/home/Home";
import { useParticipants } from "../../participant/hooks";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import { Popper } from "@mui/base";
import { EventClickArg } from "@fullcalendar/core";
import DateBlocker from "../../inputs/DateBlocker/DateBlocker";
import MatchesCalendar from "./calendar/MatchesCalendar";

const useMatchScheduler = () => {
  const { data: tournament } = useTournament("current");
  const { data: participants } = useParticipants();

  const scheduleMatch = useMutation({
    mutationFn: async (values: { id: string; date: Date }) => {
      const res = await axios.patch(`/api/matches/${values.id}`, values);
      return res.data;
    },
  });

  return (start: Dayjs, adminBlocked: Dayjs[], matches: any[]) => {
    const byRound = _.groupBy(matches, (m) => {
      const round = tournament?.rounds.find((r: any) => r.id === m.round);
      return round.number;
    });
    const matchesByRound = Object.values(byRound);

    let day = start.subtract(1, "day");
    let round = 0;

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
};



function MatchesPage() {
  const { data: unscheduledMatches, status: unscheduledStatus } = useMatches({
    status: "unscheduled",
  });

  const handleScheduleMatches = useMatchScheduler();

  if (unscheduledStatus !== "success") return <div>Loading...</div>;

  const nextMonday = dayjs().day(8);

  return (
    <div>
      <MatchesCalendar></MatchesCalendar>
      <MatchesTable matches={unscheduledMatches}></MatchesTable>

      <Formik
        initialValues={{
          start: nextMonday,
          blocked: [] as Dayjs[],
        }}
        onSubmit={(values) =>
          handleScheduleMatches(
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

export default MatchesPage;
