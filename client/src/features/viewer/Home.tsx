import { Box, Typography, Container, Stack, CircularProgress, useTheme, Button } from "@mui/material";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { useStandings } from "../stage/hooks";
import { useStages } from "../stage/hooks";
import { useTournament } from "../tournament/hooks";
import MatchesCalendar from "../match/MatchesCalendar";
import "./Home.css";
import { FinalStandingsItem } from "brackets-manager";
import brush from "./brush.png";
import { LoadingBackdrop } from "../layout/LoadingBackdrop";
import { ArrowDropDown } from "@mui/icons-material";
import { PromptContainer } from "../layout/PromptContainer";

function WinnerPane({ stageId }: { stageId: string }) {
  //FIXME: needs to show all winners across divisions
  const { data: standings } = useStandings(stageId);

  if (!standings) return <>Loading...</>;

  const winner = (standings as FinalStandingsItem[])[0];
  return <>
    <Typography>
      Congratulations to {winner.name} for winning !
    </Typography>
  </>
}

function WinnersTribute() {
  const { data: tournament } = useTournament("current");
  const { data: stages } = useStages(tournament?.id, {
    type: "single_elimination"
  });

  return stages?.map(s => (<WinnerPane stageId={s.id} key={s.id}></WinnerPane>))

}

function CopaBanner({ children }: { children: React.ReactNode }) {
  const { data: tournament } = useTournament("current");

  return (
    <PromptContainer sx={{ justifyContent: "center" }}>
      <Box component="img" src={brush} sx={{
        position: "absolute",
        width: "95vw",
        zIndex: -1,
        rotate: "-2deg",
      }}></Box>
      <Box sx={{
        backdropFilter: "blur(30px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "80vw",
        height: "80vw",
        minHeight: "400px"
      }}>
        <Stack direction="row" alignItems={"center"} width="100%" spacing={0} justifyContent={"center"}>
          <Typography variant="h1" fontWeight={800} sx={{ fontSize: "15vw!important" }} noWrap>
            {tournament?.name?.toUpperCase()}
          </Typography>
          <Typography sx={{
            textOrientation: "upright",
            writingMode: "vertical-rl",
            fontSize: "2vw!important"
          }}>
            {dayjs().year()}
          </Typography>
        </Stack>
        {/* <Typography variant="subtitle1" sx={{mt: -2, mb: 5}}>is here!</Typography> */}

        {children}
      </Box>
    </PromptContainer>
  )
}

function HomePage() {
  const { data: tournament, status } = useTournament("current");

  if (status !== "success") {
    return <LoadingBackdrop open={true} sx={{ zIndex: 20 }}></LoadingBackdrop>
  }

  switch (tournament.state) {
    case undefined:
      return <Container maxWidth="md" sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "500px"
      }}>
        <Typography>No tournament yet. Stay tuned.</Typography>
      </Container>

    case "Complete":
      return <WinnersTribute></WinnersTribute>
    case "Registration":
      if (!tournament.registration?.from)
        return <CopaBanner>
          <Typography variant="subtitle1" >
            Registration is just around the corner.
          </Typography>
        </CopaBanner>

      const now = new Date();
      const from = new Date(tournament.registration.from);

      if (now <= from)
        return (
          <CopaBanner>
            <Typography variant="subtitle1" >
              Registration begins {dayjs().to(tournament.registration.from)}.
            </Typography>
          </CopaBanner>
        )


      const to = tournament.registration?.to && new Date(tournament.registration.to);

      if (!to || now <= to) return (
        <>
          <CopaBanner>
            <Typography variant="body1" noWrap>
              {to ? `Registration closes ${dayjs().to(tournament.registration.to)}!` : "Hurry up! There is still time to register."}
            </Typography>
            <Link to="/tournament/register">
              <Box sx={{ display: "flex", position: "relative", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <Button variant="contained" sx={{ mt: 3, }} color="secondary">
                  Register
                </Button>
              </Box>
            </Link>
          </CopaBanner >
        </>
      );

      return (
        <CopaBanner>
          <Typography variant="body1" noWrap>
            {`Sorry, registration closed ${dayjs().to(tournament.registration.to)}. The tournament will begin soon.`}
          </Typography>
        </CopaBanner >
      )

    default:
      return (
        <Container sx={{ p: 5, pt: 10 }} maxWidth="xl">
          <Stack direction={{ xs: "column", md: "row" }} spacing={5} display="flex" justifyContent="center">
            <MatchesCalendar></MatchesCalendar>
            <Box display="flex" justifyContent="center">
              <Box sx={{
                background: "linear-gradient(150deg, var(--copa-aqua), 20%, var(--copa-purple) 55%, 80%, var(--copa-pink))",
                height: { xs: "90vmin", md: "55vmin", lg: "70vmin" },
                width: { xs: "90vmin", md: "55vmin", lg: "70vmin" },
              }}

                display="flex" justifyContent="center" alignItems="center" minHeight="100%"
              >
                <Typography>No instagram content to display.</Typography>
              </Box>
            </Box>
          </Stack >
        </Container >
      );
  }
}

export default HomePage;
