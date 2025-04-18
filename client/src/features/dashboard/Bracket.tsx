import { Alert, AlertTitle, Button, Typography } from "@mui/material";
import { Status } from "brackets-model";
import { groupBy } from "lodash";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { DivisionContext } from "../../index.tsx";
import DivisionPanel from "../layout/DivisionPanel.tsx";
import { useMatches } from "../match/hooks.ts";
import { useStages } from "../stage/hooks.ts";
import { useDivisions, useTournament } from "../tournament/hooks.ts";
import NumberCard from "./NumberCard.tsx";

function Bracket({ next, prev }) {
  const { data: tournament } = useTournament("current");

  //all divisions
  const { data: divisions } = useDivisions(tournament?.id);
  const { data: stages } = useStages(tournament?.id, {
    type: "single_elimination",
  });
  const { data: allMatches } = useMatches(tournament?.id);
  const matchesByStage = groupBy(allMatches, "stage_id");

  //chosen division
  const division = useContext(DivisionContext);
  const bracket = stages?.find((s) => s.division === division.id);
  const matches = matchesByStage[bracket?.id];

  const scheduledMatches = matches?.filter((m) => !!m.start);
  const completedMatches = matches?.filter((m) => m.status >= Status.Completed);

  const [noBracketAlert, setNoBracketAlert] = useState(false);
  const [incompleteMatchesAlert, setIncompleteMatchesAlert] = useState(false);

  const handleClickNext = () => {
    // for (const division of divisions) {
    //   const stage = stages.find((s) => s.division === division.id);

    //   if (!stage) {
    //     return setNoBracketAlert({
    //       division: division.name,
    //     });
    //   }

    //   const matches = matchesByStage[stage.id];
    //   const completedMatches = matches?.filter(
    //     (m) => m.status >= Status.Completed
    //   );

    //   if (!matches || matches.length - completedMatches.length !== 0) {
    //     return setIncompleteMatchesAlert({
    //       division: division.name,
    //     });
    //   }

    next();
  };

  const handleClickPrev = () => {
    prev();
  };

  return (
    <>
      {noBracketAlert ? (
        <Alert severity="error">
          <AlertTitle>
            No bracket for the '{noBracketAlert.division}' name
          </AlertTitle>
          <Typography>
            Please create the structure of the bracket before proceeding.
          </Typography>
        </Alert>
      ) : null}
      {incompleteMatchesAlert ? (
        <Alert severity="error">
          <AlertTitle>
            Error: incomplete matches in the bracket of the '
            {incompleteMatchesAlert.division}' division.
          </AlertTitle>
          <Typography>
            Can't proceed before all the matches in the bracket are complete. If
            you already know the results, enter them manually here.
          </Typography>
        </Alert>
      ) : null}
      <DivisionPanel>
        {!bracket ? (
          <Link to="/tournament/structure">Arrange bracket</Link>
        ) : (
          <>
            <NumberCard
              number={`${scheduledMatches?.length}/${matches?.length}`}
            >
              matches scheduled
            </NumberCard>
            <NumberCard
              number={`${completedMatches?.length}/${matches?.length}`}
            >
              matches complete
            </NumberCard>
            <Link to="/tournament/scheduler">
              <Button>Schedule matches</Button>
            </Link>
          </>
        )}
      </DivisionPanel>

      <Button onClick={handleClickPrev}>Previous</Button>
      <Button onClick={handleClickNext}>Next</Button>
    </>
  );
}

export default Bracket;
