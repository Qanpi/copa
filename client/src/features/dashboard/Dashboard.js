import {
  Step,
  StepButton,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import NewTournamentPage from "./NewTournament.js";
import RegistrationStage from "./Registration.js";
import { useTournament, useUpdateTournament } from "../tournament/hooks.ts";
import GroupStage from "./GroupStage.js";
import BracketStructure from "./BracketStructure.tsx";
import Bracket from "./Bracket.tsx";
import CreateTournamentPage from "./CreateTournament.tsx";

function DashboardPage() {
  const { data: tournament } = useTournament("current");
  const updateTournament = useUpdateTournament(tournament?.id);

  if (!tournament?.id) return <CreateTournamentPage></CreateTournamentPage>;

  const currentSection = () => {
    switch (tournament.state) {
      case "Registration":
        return (
          <RegistrationStage
            next={nextSection}
            prev={prevSection}
          ></RegistrationStage>
        );
      case "Group stage":
        return <GroupStage next={nextSection} prev={prevSection}></GroupStage>;
      case "Bracket":
        return <Bracket next={nextSection} prev={prevSection}></Bracket>;
      case "Complete": 
          return <>COngrats! You've completed {tournament.name}</>
      default:
        return <Typography>Unknown tournament state.</Typography>;
    }
  };

  const stateId = tournament.states.indexOf(tournament.state);

  const nextSection = () => {
    const next = tournament.states[stateId + 1];
    updateTournament.mutate({ state: next });
  };

  const prevSection = () => {
    const prev = tournament.states[stateId - 1];
    updateTournament.mutate({ state: prev });
  };

  return (
    <>
      <Stepper activeStep={stateId} orientation="vertical">
        {tournament.states.map((s, i) => (
          <Step key={i}>
            <StepLabel>{s}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {currentSection()}
    </>
  );
}

export default DashboardPage;
