import { Box, Typography, Container, Stack } from "@mui/material";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { useStandings } from "../stage/hooks";
import { useStages } from "../stage/hooks";
import { useTournament } from "./hooks";
import MatchesCalendar from "../match/MatchesCalendar";
import "./Home.css";
import { FinalStandingsItem } from "brackets-manager";

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

function HomePage() {
  const { data: tournament } = useTournament("current");

  switch (tournament?.state) {
    case "Complete":
      return <WinnersTribute></WinnersTribute>
    case "Registration":
      if (!tournament.registration?.from)
        return <>Registration will be starting soon.</>

      const now = new Date();
      const from = new Date(tournament.registration.from);

      if (now <= from)
        return (
          <div>
            Registration will begin {dayjs().to(tournament.registration.from)}.
          </div>
        )

      if (!tournament.registration?.to)
        return <>Hurry up! Registration will be closing soon.</>;

      const to = new Date(tournament.registration.to);

      if (now <= to) return (
        <>
          <div>
            Registration closes {dayjs().to(tournament.registration.to)}.
          </div>
          <Link to="/tournament/register">Register</Link>
        </>
      );

      else return <>Registration ended {dayjs().to(tournament.registration.to)} THe tournament will begin soon.</>

    default:
      return (
        <Container sx={{ pt: 15}} maxWidth="xl">
          <Stack direction={{ xs: "column-reverse", md: "row" }} spacing={10} display="flex" justifyContent="center">
            <MatchesCalendar></MatchesCalendar>
            <Box display="flex" justifyContent="center">
              <Box sx={{
                background: "linear-gradient(150deg, var(--copa-aqua), 20%, var(--copa-purple) 55%, 80%, var(--copa-pink))",
                height: { xs: "70vh", md: "60vmin" },
                width: { xs: "100%", md: "60vmin" },
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
