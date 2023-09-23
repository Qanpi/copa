import { Step, StepButton, StepLabel, Stepper, Typography } from "@mui/material";
import NewTournamentPage from "./NewTournament.js";
import RegistrationStage from "./Registration.js";
import { useTournament } from "../tournament/hooks.ts";
import GroupStage from "./GroupStage.js";

function DashboardPage() {
  const state = "group stage";
  const { data: tournament } = useTournament("current");

  if (!tournament) return <NewTournamentPage></NewTournamentPage>;

  const currentSection = () => {
    switch (tournament.state) {
      case "Registration":
        return <RegistrationStage></RegistrationStage>;
      case "group stage":
        return <GroupStage></GroupStage>;
      default:
        return <Typography>Unknown tournament state.</Typography>
    }
  };

  const stepId = tournament.states.indexOf(tournament.state);

  return (
    <>
      <Stepper activeStep={stepId} orientation="vertical">
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
