import "./userpanel.css";
import axios from "axios";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { useTeam } from "../../team/hooks.ts";
import { useUser } from "../hooks.ts";
import { userKeys } from "../hooks.ts";
import SignInButton from "../SignInPage.tsx";
import { Button , Typography } from "@mui/material";
import GoogleIcon from "../googleIcon.tsx";
import { Google } from "@mui/icons-material";

function UserPanel() {
  const { status: userStatus, data: user } = useUser("me");
  const queryClient = useQueryClient();

  const handleSignIn = () => {
    window.open(`http://localhost:3001/login/federated/google`, "_self");
  };

  const logout = useMutation({
    mutationFn: async () => {
      return await axios.delete("/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(userKeys.id("me"));
    },
  });

  return user ? (
    <div className="user-panel">
      <div className="profile">
        <img src={user.avatar} referrerPolicy="no-referrer" alt="user avatar" />
        <p>{user.name}</p>
      </div>
      <div className="dropdown">
        <Link to={`/users/${user.id}`}>Profile</Link>
        {user.team ? (
          <Link to={`/teams/${user.team.name}`}>My team</Link>
        ) : (
          <Link to={`/teams/none`}>My team</Link>
        )}
        <p>Settings</p>
        <p onClick={logout.mutate}>Log out</p>
      </div>
    </div>
  ) : (
    <Button
      onClick={handleSignIn}
      variant="outlined"
      sx={{ padding: 0, paddingRight: 2, paddingLeft: 2, height: "70%"  }}
      startIcon={<Google></Google>}
    >
      <Typography variant="button">Sign in with Google</Typography>
    </Button>
  );
}

export default UserPanel;
