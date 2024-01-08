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
import { useDivisions, useTournament } from "../tournament/hooks.ts";
import DivisionPanel from "../layout/DivisionPanel.tsx";
import NumberCard from "./NumberCard.tsx";
import AdminAlertStack from "../layout/AdminAlert.tsx";

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

  type AdminError = {
    title: String,
    overridable?: Boolean,
    body?: String,
  }
  const [adminErrors, setAdminErrors] = useState<AdminError[]>([]);
  const hasErrors = adminErrors.length > 0;
  const overrideErrors = hasErrors && adminErrors.every(e => e.overridable);

  const handleClickNext = () => {
    //override errors
    if (overrideErrors) next();

    for (const division of divisions) {
      const stage = stages.find((s) => s.division === division.id);

      if (!stage) {
        return setAdminErrors([{
          title: `No group stage for the '${division.name}' division.`,
          body: "Please draw teams using the wheel before proceeding to the bracket."
        }]);
      }

      const matches = matchesByStage[stage.id];
      const completedMatches = matches?.filter(
        (m) => m.status >= Status.Completed
      );

      if (!matches || matches.length - completedMatches.length !== 0) {
        return setAdminErrors([{
          title: `Incomplete matches in the group stage of the '${division.name}' division.`,
        }]);
      }
    }

    next();
  };

  const handleClickPrev = () => {
    prev();
  };

  return (
    <Container maxWidth="lg">
      <AdminAlertStack>
        {adminErrors.map(e => {
          return <Alert severity="error">
            <AlertTitle>
              {e.title}
            </AlertTitle>
            <Typography>
              {e.body}
            </Typography>
          </Alert>;
        })}
      </AdminAlertStack>

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
          )
          }
        </Stack >
        {groupStage ? <Link to="/tournament/scheduler">
          < Button fullWidth variant="contained" color="secondary" >
            Schedule matches
          </Button >
        </Link > : null}
      </DivisionPanel >

      {overrideErrors ? <Alert severity="info" sx={{mb: 1, mt: 3}}>
        <AlertTitle>Press 'next' again to override errors.</AlertTitle>
        <Typography>ONLY if you know what you're doing!</Typography>
      </Alert> : null}
      <Button onClick={handleClickPrev}>Previous</Button>
      <Button onClick={handleClickNext}>Next</Button>
    </Container >
  );
}

export default GroupStage;
