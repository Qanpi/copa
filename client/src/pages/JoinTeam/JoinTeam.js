import { useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import { Button } from "@mui/material";
import { AuthContext } from "../..";
import { Link } from "react-router-dom";

function JoinTeamPage() {
  const user = useContext(AuthContext);

  return (
    <>
      <div>
        To join a team, paste in the link.
        <Button>Join</Button>
      </div>
      <div>
        <Link to="/teams/new">
            <Button>Create</Button>
        </Link>
      </div>
    </>
  );
}

export default JoinTeamPage;
