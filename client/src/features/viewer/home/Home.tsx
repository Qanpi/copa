import { Link } from "react-router-dom";
import { useTournament } from "../../tournament/hooks";
import GameBoard from "./GameBoard/gameboard";
import "./Home.css";
import InstagramBoard from "./InstagramBoard/instagramboard";
import * as dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useLayoutEffect, useMemo } from "react";
import { useMatches } from "../../tournament/matches/hooks";
import MatchesCalendar from "../../tournament/matches/calendar/MatchesCalendar";
import { Box, Typography } from "@mui/material";
import { useStageData } from "../../tournament/groupStage/GroupStage";
import { useStandings } from "../../dashboard/BracketStructure";

function WinnerTribute() {
  const { data: tournament } = useTournament("current");
  const {data: standings} = useStandings(tournament?.bracket?.id);

  if (!standings) return <>Loading...</>;

  const winner = standings[0];

  return <>
    <Typography>
      Congratulations to {winner.name} for winning Copa x.
    </Typography>
  </>
}

function HomePage() {
  const { data: tournament } = useTournament("current");

  const startOfWeek = useMemo(() => dayjs().day(1), []);
  const { data: matches } = useMatches({ start: startOfWeek.toDate() });

  if (!tournament) return <>Loadng...</>

  if (tournament.state === "Complete") 
    return <WinnerTribute></WinnerTribute>

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
