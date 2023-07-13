import { Link } from "react-router-dom";
import { AuthContext, TournamentContext } from "../..";
import GameBoard from "../../components/GameBoard/gameboard";
import Header from "../../components/Header/header";
import InstagramBoard from "../../components/InstagramBoard/instagramboard";
import CreateTeamPage from "../CreateTeam/CreateTeam";
import RegistrationPage from "../Registration/Registration";
import "./Home.css";
import { useState, useEffect, useContext } from "react";

function Home() {
  const tournament = useContext(TournamentContext);

  //tournament?
  //registration -> register screen + countdown
  //otherwise -> display countdown to next event
  //group stage/bracket -> dashboard
  //previous winner page
  if (tournament) {
    return tournament.registration.status === "over" ? (
      <>
        <div className="dashboard">
          <GameBoard></GameBoard>
          <InstagramBoard></InstagramBoard>
        </div>

        <div className="group-stage" id="test">
          <GameBoard></GameBoard>
        </div>
      </>
    ) : (
      <Link to="/register">Register</Link>
    );
  }

  return <div className="banner">Winner page.</div>;
}

export default Home;
