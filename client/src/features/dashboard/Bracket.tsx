import {
    Alert,
    AlertTitle,
    Button,
    Typography
} from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTournament } from "../tournament/hooks.ts";
import { useMatches } from "../tournament/matches/hooks.ts";
import NumberCard from "./NumberCard.tsx";
import { Status } from "brackets-model";

function Bracket({ next, prev }) {
  const { data: tournament } = useTournament("current");

  const { data: matches } = useMatches({
    stage_id: tournament?.bracket?.id,
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
      {!tournament?.bracket? (
        <Link to="/tournament/structure">Arrange bracket</Link>
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

export default Bracket;