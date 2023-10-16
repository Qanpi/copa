import { Google } from "@mui/icons-material";
import { Button, Typography, useMediaQuery } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import { useUser, userKeys } from "../hooks.ts";
import "./userpanel.css";

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

  const minified = useMediaQuery((theme) => theme.breakpoints.down("lg"));

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
      sx={{
        padding: 0,
        paddingRight: 1,
        paddingLeft: 1,
        height: "100%",
        minWidth: "30px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Google></Google>
      {minified ? null : (
        <Typography variant="button" sx={{ml: 1}}>Sign in with Google</Typography>
      )}
    </Button>
  );
}

export default UserPanel;
