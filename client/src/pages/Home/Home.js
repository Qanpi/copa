import { TournamentContext } from "../..";
import GameBoard from "../../components/GameBoard/gameboard";
import Header from "../../components/Header/header";
import InstagramBoard from "../../components/InstagramBoard/instagramboard";
import "./Home.css";
import { useState, useEffect, useContext } from "react";

function Home() {
  const tournament = useContext(TournamentContext);

  if (!tournament) return <div className="banner">Winner page.</div>;

  switch (tournament.stageId) {
    case "Tournament":
      break;

    case "finished":
      break;

    default:
      return (
        <div className="banner">
          <div className="title-wrapper">
            <h1>{tournament.displayName}</h1>
            <h3>is just around the corner!</h3>
          </div>

          <p>{tournament.countdown}</p>
        </div>
      );
  }

  return tournament ? ( //TODO: invert
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
    <div className="banner">
      <div className="title-wrapper">
        <h1>{tournament.displayName}</h1>
        <h3>is just around the corner!</h3>
      </div>

      <p>Registration begins in 9 days.</p>
    </div>
  );
}

export default Home;
