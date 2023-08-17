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
import dayjs, { Dayjs } from "dayjs";
import Weekday from "dayjs/plugin/weekday";
import { Form, Formik, useField, useFormikContext } from "formik";
import { useReducer, useState } from "react";
import MyDatePicker from "../../inputs/datePicker/MyDatePicker";
import { MatchesTable } from "./table/MatchesTable";
import { useMatches } from "./hooks";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import { Popper } from "@mui/base";
import { EventClickArg } from "@fullcalendar/core";
import DateBlocker from "../../inputs/DateBlocker/DateBlocker";
import MatchesCalendar from "./calendar/MatchesCalendar";
import { useMatchScheduler } from "./hooks";

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
