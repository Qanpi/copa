import { Button, Card, CardContent, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { Formik, Form } from "formik";
import MyDatePicker from "../inputs/MyDatePicker.js";
import { Popper } from "@mui/base";
import { EventClickArg } from "@fullcalendar/core";
import DateBlocker from "../inputs/DateBlocker.tsx";
import dayjs, { Dayjs } from "dayjs";
import { useMatchScheduler, useMatches } from "../tournament/matches/hooks.ts";
import DrawPage from "./Draw.tsx";
import GroupStageStructure from "./GroupStageStructure.tsx";
import Scheduler from "./Scheduler.tsx";
import { useTournament } from "../tournament/hooks.ts";
import { useStageData } from "../tournament/groupStage/GroupStage.tsx";
import NumberCard from "./NumberCard.tsx";

function GroupStage({next, prev}) {
  const {data: tournament} = useTournament("current");

  const { data: matches } = useMatches({
    stage_id: tournament?.groupStage.id
  });

  //TODO: refactor to server side ?
  const unscheduledMatches = matches?.filter(m => !m.start)
  const scheduledMatches = matches?.filter(m => !!m.start)
  const completedMatches = matches?.filter(m => m.verboseStatus === "Completed")

  const handleScheduleMatches = useMatchScheduler();

  const handleClickNext = () => {
    next();
  }

  const handleClickPrev = () => {
    prev();
  }

  return (
    <>
      <DrawPage></DrawPage>

      <Formik
        initialValues={{
          start: dayjs().day(8), //next Monday
          blocked: [], //next Monday
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

      <NumberCard number={`${scheduledMatches?.length}/${matches?.length}`}>matches scheduled</NumberCard>
      <NumberCard number={`${completedMatches?.length}/${matches?.length}`}>matches complete</NumberCard>

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
