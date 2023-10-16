import {
  Box,
  Container,
  Stack,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import NewTournamentPage from "./NewTournament.js";
import RegistrationStage from "./Registration.tsx";
import { useTournament, useUpdateTournament } from "../viewer/hooks.ts";
import GroupStage from "./GroupStage.js";
import BracketStructure from "./BracketStructure.tsx";
import Bracket from "./Bracket.tsx";
import CreateTournamentPage from "./CreateTournament.tsx";
import GradientTitle from "../viewer/gradientTitle.tsx";

function DashboardPage() {
  const { data: tournament } = useTournament("current");
  const updateTournament = useUpdateTournament(tournament?.id);

  if (!tournament?.id) return <CreateTournamentPage></CreateTournamentPage>;

  const currentSection = (): any => {
    switch (tournament.state) {
      case "Registration":
        return (
          <RegistrationStage
            next={nextSection}
            prev={prevSection}
          ></RegistrationStage>
        );
      case "Groups":
        return <GroupStage next={nextSection} prev={prevSection} ></GroupStage>;
      case "Bracket":
        return <Bracket next={nextSection} prev={prevSection} ></Bracket>;
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
    <Box sx={{ pt: 7 }}>

      <GradientTitle padding={3}>
        <Stack spacing={10} direction="row" sx={{ height: "100%" }} justifyContent={"center"} alignItems={"center"}>
          <Typography variant="h2" fontWeight={800}>{tournament.name}</Typography>
          <Stepper activeStep={stateId} orientation="horizontal">
            {
              tournament.states.map((s, i) => (
                <Step key={i} >
                  <StepLabel>{s} </StepLabel>
                </Step>
              ))
            }
          </Stepper>
        </Stack>
      </GradientTitle>
      <Container>
        {currentSection()}
      </Container>
    </Box>
  );
}

export default DashboardPage;
