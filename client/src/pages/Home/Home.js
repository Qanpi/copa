import { use } from "passport";
import { AuthContext, TournamentContext } from "../..";
import GameBoard from "../../components/GameBoard/gameboard";
import Header from "../../components/Header/header";
import InstagramBoard from "../../components/InstagramBoard/instagramboard";
import TeamInfoForm from "../../components/TeamInfoForm/teaminfoform";
import CreateTeamPage from "../CreateTeam/CreateTeam";
import "./Home.css";
import { useState, useEffect, useContext } from "react";

function Home() {
  const tournament = useContext(TournamentContext);
  const user = useContext(AuthContext);

  if (!tournament) return <div className="banner">Winner page.</div>;

  if (tournament && !tournament.isRegistrationOver) {
    if (user.team && user.roles.includes("leader")) return (
      <>
        <div>You are currently the leader of {user.team.name}</div>
        <p>Register</p>
        <div>
          <p>Verify the information below.</p>
          <TeamInfoForm></TeamInfoForm>
          <p>Team name, division, contacts, logo and pics</p>
          <p>Players</p>
        </div>
      </>
    );
    else if (user.team)
      return (
        <>
          <div>
            <p>You are currently a member of {user.team.name}</p>
          <p>Please ask the leader of your team to register.</p>
          <p>If you wish to play in another team, please leave the current one and join/create a new team.</p>
            </div>
        </>
      );
    else
      return (
        <>
          <div>You are not currently in a team.</div>
          <p>Please join or create a team in order to participate.</p>
        </>
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
        <h1>{tournament.name}</h1>
        <h3>is just around the corner!</h3>
      </div>

      <p>Registration begins in 9 days.</p>
    </div>
  );
}

export default Home;
