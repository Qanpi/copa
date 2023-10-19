import { Google } from "@mui/icons-material";
import { Stack, Box, Button, Theme, Typography, useMediaQuery, MenuItem, Menu, Breakpoint, ButtonProps } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import { useUser, userKeys } from "../hooks.ts";
import "./userpanel.css";
import { DropdownMenu } from "../../viewer/header.tsx";

function UserPanel() {
  const { status: userStatus, data: user } = useUser("me");
  const queryClient = useQueryClient();


  const logout = useMutation({
    mutationFn: async () => {
      return await axios.delete("/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(userKeys.id("me"));
    },
  });

  const minified = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));

  return user ? (
    <DropdownMenu anchor={
      <Stack direction="row" display={"flex"} alignItems="center" spacing={1}>
        <Box component="img" src={user.avatar} referrerPolicy="no-referrer" alt="user avatar" sx={{ width: "32px", height: "32px" }}></Box>
        {minified ? null : <Typography>{user.name}</Typography>}
      </Stack>
    }>
      <Link to={`/users/${user.id}`}>
        <MenuItem>Profile</MenuItem>
      </Link>
      <Link to={`/team/${user.team ? user.team.name : "none"}`}>
        <MenuItem>My team</MenuItem>
      </Link>
      <Link to="/settings">
        <MenuItem>Settings</MenuItem>
      </Link>
      <MenuItem onClick={_ => logout.mutate()}>Sign out</MenuItem>
    </DropdownMenu>
    // <div className="user-panel">
    //   <div className="profile">
    //     <img src={user.avatar} referrerPolicy="no-referrer" alt="user avatar" />
    //     <p>{user.name}</p>
    //   </div>
    //   <div className="dropdown">
    //     <Link to={`/users/${user.id}`}>Profile</Link>
    //     {user.team ? (
    //       <Link to={`/teams/${user.team.name}`}>My team</Link>
    //     ) : (
    //       <Link to={`/team/none`}>My team</Link>
    //     )}
    //     <p>Settings</p>
    //     <p onClick={logout.mutate}>Log out</p>
    //   </div>
    // </div>
  ) : (
    <GoogleSignInButton breakpoint={"md"}></GoogleSignInButton>
  );
}

export const GoogleSignInButton = ({ breakpoint, ...props } : { breakpoint?: Breakpoint | number } & ButtonProps) => {
  const handleSignIn = () => {
    window.open(`http://localhost:3001/login/federated/google`, "_self");
  };

  const minified = useMediaQuery((theme: Theme) => theme.breakpoints.down(breakpoint || 0));

  return <Button
    onClick={handleSignIn}
    variant="outlined"
    sx={{
      padding: 1,
      minWidth: "30px",
      justifyContent: "center",
      alignItems: "center",
    }}
    {...props}
  >
    <Google></Google>
    {minified ? null : (
      <Typography variant="button" sx={{ ml: 1 }}>Sign in with Google</Typography>
    )}
  </Button>
}

export default UserPanel;
