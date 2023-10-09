import { Box, Typography } from "@mui/material";
import * as dayjs from "dayjs";
import { Link } from "react-router-dom";
import { useStandings } from "../../dashboard/BracketStructure";
import { useStages } from "../../stage/hooks";
import { useTournament } from "../../tournament/hooks";
import MatchesCalendar from "../../tournament/matches/calendar/MatchesCalendar";
import "./Home.css";

function WinnerPane({ stage }) {
  //FIXME: needs to show all winners across divisions
  const { data: standings } = useStandings(stage.id);

  if (!standings) return <>Loading...</>;

  const winner = standings[0];

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

  return stages?.map(s => (<WinnerPane stage={s} key={s.id}></WinnerPane>))

}

function HomePage() {
  const { data: tournament } = useTournament("current");

  if (!tournament) return <>Loadng...</>

  if (tournament.state === "Complete")
    return <WinnersTribute></WinnersTribute>

  if (!tournament.registration?.from)
    return <>Registration will be starting soon.</>

  const now = new Date();
  const from = new Date(tournament.registration.from);
  const to = new Date(tournament.registration.to);

  if (now <= from)
    return (
      <div>
        Registration will begin {dayjs().to(tournament.registration.from)}.
      </div>
    );

  if (now <= to)
    return (
      <>
        <div>
          Registration closes {dayjs().to(tournament.registration.to)}.
        </div>
        <Link to="/tournament/register">Register</Link>
      </>
    );

  return (
    <>
      <div className="dashboard">
        <MatchesCalendar></MatchesCalendar>
        <Box sx={{
          width: "700px",
          height: "700px",
          background: "linear-gradient(150deg, var(--copa-aqua), 20%, var(--copa-purple) 55%, 80%, var(--copa-pink))"
        }}></Box>
      </div>

      <div className="group-stage" id="test">
        <div className="brackets-viewer"></div>
      </div>
    </>
  );


}

export default HomePage;
