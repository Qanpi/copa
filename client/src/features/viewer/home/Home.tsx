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

function HomePage() {
  const { data: tournament } = useTournament("current");

  const startOfWeek = useMemo(() => dayjs().day(1), []);
  const { data: matches } = useMatches({ start: startOfWeek.toDate() });

  if (!tournament)
    return <div className="banner">Winner page.</div>;

  if (!tournament.registration.from)
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
        <Link to="/register">Register</Link>
      </>
    );

  return (
    <>
      <div className="dashboard">
        <GameBoard></GameBoard>
        <InstagramBoard></InstagramBoard>
      </div>

      <div className="group-stage" id="test">
        <div className="brackets-viewer"></div>
      </div>
    </>
  );


}

export default HomePage;
