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

function GroupStage({ next, prev }) {
  const { data: tournament } = useTournament("current");
  const { groupStage } = tournament;

  const { data: matches } = useMatches({
    stage_id: groupStage?.id,
  });

  const scheduledMatches = matches?.filter((m) => !!m.start);
  const completedMatches = matches?.filter(
    (m) => m.verboseStatus === "Completed"
  );

  const handleClickNext = () => {
    next();
  };

  const handleClickPrev = () => {
    prev();
  };

  return (
    <>
      {!groupStage ? (
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
