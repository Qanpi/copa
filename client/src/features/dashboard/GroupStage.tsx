import {
  Alert,
  AlertTitle,
  Button,
  Container,
  Stack,
  ThemeProvider,
  Typography
} from "@mui/material";
import { Status } from "brackets-model";
import { groupBy } from "lodash-es";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { DivisionContext } from "../../index.tsx";
import { lightTheme } from "../../themes.ts";
import { useMatches } from "../match/hooks.ts";
import { useParticipants } from "../participant/hooks.ts";
import { useStages } from "../stage/hooks.ts";
import { useDivisions, useTournament } from "../viewer/hooks.ts";
import DivisionPanel from "./DivisionPanel.tsx";
import NumberCard from "./NumberCard.tsx";

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
        <ThemeProvider theme={lightTheme}>
          <Alert severity="error" sx={{mb: 5}}>
            <AlertTitle>
              No group stage for the '{noGroupStageAlert.division}' name
            </AlertTitle>
            <Typography>
              Please first draw teams using the wheel before proceeding to the
              bracket.
            </Typography>
          </Alert>
        </ThemeProvider>
      ) : null}
      {incompleteMatchesAlert ? (
        <ThemeProvider theme={lightTheme}>
          <Alert severity="error" sx={{ mb: 5 }}>
            <AlertTitle>
              Error: incomplete matches in the group stage of the '
              {incompleteMatchesAlert.division}' division.
            </AlertTitle>
            <Typography>
              Can't proceed before all the matches in the group stage are
              complete. I you already know the results, enter them manually here.
            </Typography>
          </Alert>
        </ThemeProvider>
      ) : null}

      <DivisionPanel>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} display="flex" justifyContent="center">
          <NumberCard number={participants?.length} sx={{ flexGrow: 1 }}>
            <Typography>team(s) registered</Typography>
          </NumberCard>

          {groupStage ? (
            <>
              <NumberCard
                number={`${scheduledMatches !== undefined ? scheduledMatches.length : ""
                  }/${matches !== undefined ? matches.length : ""}`}
              >
                <Typography>matches scheduled</Typography>
              </NumberCard>
              <NumberCard
                number={`${completedMatches !== undefined ? completedMatches.length : ""
                  }/${matches !== undefined ? matches.length : ""}`}
              >
                <Typography>matches complete</Typography>
              </NumberCard>
            </>
          ) : (
            <Stack
              direction="column"
              display={"flex"}
              spacing={2}
              alignItems="center"
              justifyContent={"center"}
              sx={{
                border: "1px solid white",
                padding: 3,
                borderRadius: "3px",
              }}
            >
              <Typography variant="body1">
                The next step is to assign the registered teams into groups. You
                can also do this together with the participants watching.
              </Typography>
              <Link to="/tournament/draw">
                <Button variant="contained" color="secondary">Draw groups</Button>
              </Link>
            </Stack>
          )}
        </Stack>
        {groupStage ? <Link to="/tournament/scheduler">
          <Button fullWidth variant="contained" color="secondary">
            Schedule matches
          </Button>
        </Link> : null}
      </DivisionPanel>
      <Button onClick={handleClickPrev}>Previous</Button>
      <Button onClick={handleClickNext}>Next</Button>
    </Container>
  );
}

export default GroupStage;
