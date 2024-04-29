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
import RegistrationStage from "./Registration.tsx";
import { useTournament, useUpdateTournament } from "../tournament/hooks.ts";
import GroupStage from "./GroupStage.tsx";
import BracketStructure from "./BracketStructure.tsx";
import Bracket from "./Bracket.tsx";
import CreateTournamentPage from "./CreateTournament.tsx";
import GradientTitle from "../viewer/gradientTitle.tsx";
import AdminOnlyPage from "./AdminOnlyBanner.tsx";
import { LoadingBackdrop } from "../layout/LoadingBackdrop.tsx";
import CompleteTournament from "./CompleteTournament.tsx";

function DashboardPage() {
  const { data: tournament, isLoading } = useTournament("current");
  const updateTournament = useUpdateTournament(tournament?.id);

  if (isLoading) return <LoadingBackdrop open={true}></LoadingBackdrop>

  const currentSection = (): any => {
    if (!tournament?.id) return <CreateTournamentPage></CreateTournamentPage>;

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
        return <CompleteTournament next={nextSection} prev={prevSection}></CompleteTournament>
      default:
        return <Typography>Unknown tournament state.</Typography>;
    }
  };

  const stateId = tournament?.states?.indexOf(tournament.state);

  const nextSection = () => {
    const next = tournament?.states[stateId + 1];
    updateTournament.mutate({ state: next });
  };

  const prevSection = () => {
    const prev = tournament?.states[stateId - 1];
    updateTournament.mutate({ state: prev });
  };

  return (
    <AdminOnlyPage>
      <Box sx={{ pt: 7 }}>
        <GradientTitle>
          <Stack direction="row" sx={{ height: "100%" }} justifyContent={"center"} alignItems={"center"}>
            <Typography variant="h2" fontWeight={800} minWidth={"4em"}>{tournament?.name || "Kickstart Copa"}</Typography>
            <Stepper activeStep={stateId} orientation="horizontal">
              {
                tournament?.states?.map((s, i) => (
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
    </AdminOnlyPage>
  );
}

export default DashboardPage;
