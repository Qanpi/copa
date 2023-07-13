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
  const user = useContext(AuthContext);

  //tournament?
  //registration -> register screen + countdown
  //otherwise -> display countdown to next event
  //group stage/bracket -> dashboard
  //previous winner page
  if (tournament) {
    switch (tournament.registration.status) {
      case "indefinite":
      case "awaiting":
        return (
          <div className="banner">
            <div className="title-wrapper">
              <h1>{tournament.name}</h1>
              <h3>is just around the corner!</h3>
            </div>

            <p>
              Registration begins{" "}
              {tournament.registration.status === "indefinite"
                ? "soon"
                : "in x days"}{" "}
            </p>
          </div>
        );
      case "in progress":
        return <RegistrationPage></RegistrationPage>;
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
