import { Button, Card, CardContent, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { Formik, Form } from "formik";
import MyDatePicker from "../inputs/MyDatePicker.js";
import { Popper } from "@mui/base";
import { EventClickArg } from "@fullcalendar/core";
import DateBlocker from "../inputs/DateBlocker.tsx";
import dayjs, { Dayjs } from "dayjs";
import { useMatchScheduler, useMatches } from "../tournament/matches/hooks.ts";
import DrawPage from "./Draw.js";
import GroupStageStructure from "./GroupStageStructure.tsx";
import Scheduler from "./Scheduler.tsx";

function GroupStage({next, prev}) {

  const { data: unscheduledMatches, status: unscheduledStatus } = useMatches({
    status: "unscheduled",
  });

  const nextMonday = dayjs().day(8);

  const handleScheduleMatches = useMatchScheduler();

  const handleClickNext = () => {
    next();
  }

  const handleClickPrev = () => {
    prev();
  }

  return (
    <>
      <GroupStageStructure></GroupStageStructure>
      <DrawPage></DrawPage>

      <Formik
        initialValues={{
          start: nextMonday,
          blocked: [],
        }}
        onSubmit={(values) =>
          handleScheduleMatches(
            values.start,
            values.blocked,
            unscheduledMatches
          )
        }
      >
            <Form>

              <Scheduler></Scheduler>
              
              <Button type="submit">
                Automatically schedule group stage matches
              </Button>
            </Form>
      </Formik>

      <Card>
        <CardContent>
          <Typography>Matches scheduled</Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography>Matches complete</Typography>
        </CardContent>
      </Card>

      <Button onClick={handleClickPrev}>Previous</Button>
      <Button onClick={handleClickNext}>Next</Button>
      {/* maybe show groups and other related data */}
      {/* <AdminCalendar></AdminCalendar> */}
      {/* <MyChecklist items={tasks}></MyChecklist> */}
      {/* <Backdrop open={true} className="backdrop">
        <ClockIcon></ClockIcon>
        <Typography>Please wait for the registration period to end.</Typography>
      </Backdrop> */}
    </>
  );
}

export default GroupStage;
