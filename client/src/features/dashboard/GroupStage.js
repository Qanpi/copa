import {
  Box,
  Stack,
  Alert,
  AlertTitle,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Formik, Form } from "formik";
import MyDatePicker from "../inputs/MyDatePicker.js";
import { Popper } from "@mui/base";
import { EventClickArg } from "@fullcalendar/core";
import DateBlocker from "../inputs/DateBlocker.tsx";
import dayjs, { Dayjs } from "dayjs";
import { useMatchScheduler, useMatches } from "../match/hooks.ts";
import DrawPage from "./Draw.tsx";
import GroupStageStructure from "./GroupStageStructure.tsx";
import Scheduler from "./Scheduler.tsx";
import { useDivisions, useTournament } from "../viewer/hooks.ts";
import { useStageData } from "../stage/hooks.ts";
import NumberCard from "./NumberCard.tsx";
import { useContext, useState } from "react";
import { Status } from "brackets-model";
import { DivisionContext } from "../../index.tsx";
import DivisionPanel from "./DivisionPanel.tsx";
import { useGroupStageData, useStages } from "../stage/hooks.ts";
import { groupBy } from "lodash-es";
import { useParticipants } from "../participant/hooks.ts";

function GroupStage({ next, prev }) {
  const { data: tournament } = useTournament("current");

  const division = useContext(DivisionContext);
  const { data: divisions } = useDivisions(tournament?.id);

  const { data: participants } = useParticipants(tournament?.id, {
    division: division?.id,
  });

  const { data: stages } = useStages(tournament?.id, {
    type: "round_robin",
  });
  const groupStage = stages?.find((s) => s.division === division.id);

  const { data: allMatches } = useMatches(tournament?.id);
  const matchesByStage = groupBy(allMatches, "stage_id");
  const matches = matchesByStage[groupStage?.id];

  const scheduledMatches = matches?.filter((m) => !!m.start);
  const completedMatches = matches?.filter((m) => m.status >= Status.Completed);

  const [incompleteMatchesAlert, setIncompleteMatchesAlert] = useState(false);
  const [noGroupStageAlert, setNoGroupStageAlert] = useState(false);

  const handleClickNext = () => {
    for (const division of divisions) {
      const stage = stages.find((s) => s.division === division.id);

      if (!stage) {
        return setNoGroupStageAlert({
          division: division.name,
        });
      }

      const matches = matchesByStage[stage.id];
      const completedMatches = matches?.filter(
        (m) => m.status >= Status.Completed
      );

      if (!matches || matches.length - completedMatches.length !== 0) {
        return setIncompleteMatchesAlert({
          division: division.name,
        });
      }
    }
    next();
  };

  const handleClickPrev = () => {
    prev();
  };

  return (
    <Container maxWidth="md">
      {noGroupStageAlert ? (
        <Alert severity="error">
          <AlertTitle>
            No group stage for the '{noGroupStageAlert.division}' name
          </AlertTitle>
          <Typography>
            Please first draw teams using the wheel before proceeding to the
            bracket.
          </Typography>
        </Alert>
      ) : null}
      {incompleteMatchesAlert ? (
        <Alert severity="error">
          <AlertTitle>
            Error: incomplete matches in the group stage of the '
            {incompleteMatchesAlert.division}' division.
          </AlertTitle>
          <Typography>
            Can't proceed before all the matches in the group stage are
            complete. I you already know the results, enter them manually here.
          </Typography>
        </Alert>
      ) : null}

      <DivisionPanel>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <NumberCard number={participants?.length}>
            team(s) registered
          </NumberCard>
          <NumberCard number={`${scheduledMatches?.length}/${matches?.length}`}>
            matches scheduled
          </NumberCard>
          <NumberCard number={`${completedMatches?.length}/${matches?.length}`}>
            matches complete
          </NumberCard>
          <Box
            display={"flex"}
            width={"100%"}
            alignItems="center"
            justifyContent={"center"}
          >
            <Link to="/tournament/draw">
              <Button variant="contained">Draw groups</Button>
            </Link>
          </Box>
        </Stack>
      </DivisionPanel>
      <Button onClick={handleClickPrev}>Previous</Button>
      <Button onClick={handleClickNext}>Next</Button>
    </Container>
  );
}

export default GroupStage;
