import { Step, StepButton, StepLabel, Stepper } from "@mui/material";
import NewTournamentPage from "./NewTournament.js";
import RegistrationStage from "./Registration.js";
import { useTournament } from "../tournament/hooks.ts";
import GroupStage from "./GroupStage.js";

function DashboardPage() {
  const state = "group stage";
  const { data: tournament } = useTournament("current");

  const currentSection = () => {
    switch (state) {
      case "kickstart":
        return <NewTournamentPage></NewTournamentPage>;
      case "registration":
        return <RegistrationStage></RegistrationStage>;
      case "group stage":
        return <GroupStage></GroupStage>
    }
  };

  return (
    <>
      <Stepper activeStep={0} orientation="vertical">
        {tournament?.statuses.map((s, i) =>  
          <Step key={i}>
            <StepLabel>{s}</StepLabel>
          </Step>
        )}
      </Stepper>
      
      {currentSection()}
    </>
  );
}

export default DashboardPage;
