import { useContext, useEffect } from "react";
import { AuthContext } from "../..";
import { Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

function TeamPage() {
  const user = useContext(AuthContext);
  const navigate = useNavigate();

  //redirect: is it necessary? 
  useEffect(() => {
    if (user.team) return navigate(`/teams/${user.team.id}`);
  }, [user]);

  return (
    <>
      <p>You are not currently part of a team</p>
      <div>
        <Link to="/teams/create">
          <Button>Create</Button>
        </Link>
        <Link to="/teams/join">
          <Button>Join</Button>
        </Link>
      </div>
    </>
  );
}

export default TeamPage;
