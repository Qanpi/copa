import { Link } from "react-router-dom";
import { useTournament } from "../../..";
import GameBoard from "./GameBoard/gameboard";
import "./Home.css";
import InstagramBoard from "./InstagramBoard/instagramboard";
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime);

function Home() {
  const { data: tournament } = useTournament("current");

  //tournament?
  //registration -> register screen + countdown
  //otherwise -> display countdown to next event
  //group stage/bracket -> dashboard
  //previous winner page
  if (tournament) {
    switch (tournament.registration.status) {
      case "indefinite":
        return <div>Registrtion will start soon.</div>;
      case "awaiting":
        return <div>Registration will begin {dayjs().to(tournament.registration.from)}</div>;
      case "in progress":
        return <>
        <div>Registration closes {dayjs().to(tournament.registration.to)}</div>
        <Link to="/register">Register</Link>
        </>
      case "over":
        return (
          <>
            <div className="dashboard">
              <GameBoard></GameBoard>
              <InstagramBoard></InstagramBoard>
            </div>

            <div className="group-stage" id="test">
              <GameBoard></GameBoard>
            </div>
          </>
        );
    }
  }

  return <div className="banner">Winner page.</div>;
}

export default Home;
