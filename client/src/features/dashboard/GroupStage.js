import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
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
import { useState } from "react";
import { Status } from "brackets-model";

function GroupStage({ next, prev }) {
  const { data: tournament } = useTournament("current");

  const { data: matches } = useMatches({
    stage_id: tournament?.groupStage?.id,
  });

  const scheduledMatches = matches?.filter((m) => !!m.start);
  const completedMatches = matches?.filter(
    (m) => m.status >= Status.Completed
  );

  const [incompleteMatchesAlert, setIncompleteMatchesAlert] = useState(false);
  const handleClickNext = () => {
    if (matches.length - completedMatches.length !== 0) {
      return setIncompleteMatchesAlert(true);
    }
    next();
  };

  const handleClickPrev = () => {
    prev();
  };

  return (
    <>
      {incompleteMatchesAlert ? (
        <Alert severity="error">
          <AlertTitle>Error: incomplete matches</AlertTitle>
          <Typography>
            Can't proceed before all the matches in the group stage are
            complete. I you already know the results, enter them manually here.
          </Typography>
        </Alert>
      ) : null}
      {!tournament?.groupStage ? (
        <Link to="/tournament/draw">Draw teams</Link>
      ) : (
        <>
          <NumberCard number={`${scheduledMatches?.length}/${matches?.length}`}>
            matches scheduled
          </NumberCard>
          <NumberCard number={`${completedMatches?.length}/${matches?.length}`}>
            matches complete
          </NumberCard>
        </>
      )}

      <Button onClick={handleClickPrev}>Previous</Button>
      <Button onClick={handleClickNext}>Next</Button>
    </>
  );
}

export default GroupStage;
