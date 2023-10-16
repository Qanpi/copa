import { Box, Typography, Container, Stack, CircularProgress, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { useStandings } from "../stage/hooks";
import { useStages } from "../stage/hooks";
import { useTournament } from "./hooks";
import MatchesCalendar from "../match/MatchesCalendar";
import "./Home.css";
import { FinalStandingsItem } from "brackets-manager";
import brush from "./brush.png";

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
    <Container sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pt: 10
    }}>
      <Box component="img" src={brush} sx={{
        position: "absolute",
        width: "80vw",
        zIndex: -1,
        rotate: "-2deg",
      }}></Box>
      <Stack sx={{
        width: "60vw",
        height: "600px",
        backdropFilter: "blur(30px)",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <Stack direction="row" alignItems={"center"} width="100%" spacing={0} justifyContent={"center"}>
          <Typography variant="h1" fontWeight={800} sx={{ fontSize: "10vw!important" }} noWrap>
            {tournament?.name?.toUpperCase()}
          </Typography>
          <Typography sx={{
            textOrientation: "upright",
            writingMode: "vertical-rl",
          }}>
            {dayjs().year()}
          </Typography>
        </Stack>
        {/* <Typography variant="subtitle1" sx={{mt: -2, mb: 5}}>is here!</Typography> */}

        {children}
      </Stack>
    </Container>
  )
}

function HomePage() {
  const { data: tournament, status } = useTournament("current");

  if (status !== "success" || !tournament?.state) return <Container maxWidth="md" sx={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50vh"
  }}>
    {tournament?.state ? <CircularProgress></CircularProgress> : <Typography>Hmm... I must've messed something up in code.</Typography>}
  </Container>


  switch (tournament.state) {
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

      if (!tournament.registration?.to)
        return (
          <CopaBanner>
            <Typography variant="subtitle1" >
              Hurry up! There is still time to register.
            </Typography>
          </CopaBanner>
        )

      const to = new Date(tournament.registration.to);

      if (now <= to) return (
        <>
          <CopaBanner>
            <Typography variant="subtitle1" >
              Registration closes {dayjs().to(tournament.registration.to)}.
            </Typography>
          </CopaBanner >
          <Link to="/tournament/register">Register</Link>
        </>
      );

      else return <>Registration ended {dayjs().to(tournament.registration.to)} THe tournament will begin soon.</>

    default:
      return (
        <Container sx={{ pt: 10 }} maxWidth="xl">
          <Stack direction={{ xs: "column-reverse", md: "row" }} spacing={5} display="flex" justifyContent="center">
            <MatchesCalendar></MatchesCalendar>
            <Box display="flex" justifyContent="center">
              <Box sx={{
                background: "linear-gradient(150deg, var(--copa-aqua), 20%, var(--copa-purple) 55%, 80%, var(--copa-pink))",
                height: { xs: "70vh", md: "70vmin" },
                width: { xs: "100%", md: "70vmin" },
              }}

                display="flex" justifyContent="center" alignItems="center" minHeight="100%"
              >
                <Typography>Imagine an instagram feed here.</Typography>
              </Box>
            </Box>
          </Stack >
        </Container >
      );
  }
}

export default HomePage;
