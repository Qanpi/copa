import { Google } from "@mui/icons-material";
import { Stack, Box, Button, Theme, Typography, useMediaQuery, MenuItem, Menu, Breakpoint, ButtonProps, useTheme } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import { useUser, userKeys } from "./hooks.ts";
import { DropdownMenu } from "../viewer/header.tsx";

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
        <Box component="img" src={user.avatar} referrerPolicy="no-referrer" alt="user avatar" sx={{ width: "48px", height: "48px" }}></Box>
        {minified ? null : <Typography>{user.name}</Typography>}
      </Stack>
    }>
      <Link to={`/users/${user.id}`}>
        <MenuItem>Profile</MenuItem>
      </Link>
      <Link to={`/team/${user.team ? user.team.name : "none"}`}>
        <MenuItem>My team</MenuItem>
      </Link>
      <MenuItem onClick={_ => logout.mutate()}>Sign out</MenuItem>
    </DropdownMenu>
  ) : (
    <GoogleSignInButton breakpoint={"md"}></GoogleSignInButton>
  );
}

export const GoogleSignInButton = ({ breakpoint, ...props } : { breakpoint?: Breakpoint | number } & ButtonProps) => {
  const handleSignIn = () => {
    window.open(`http://localhost:3001/login/federated/google`, "_self");
  };

  const minified = useMediaQuery((theme: Theme) => theme.breakpoints.down(breakpoint || 0));
  const theme = useTheme();

  return <Button
    onClick={handleSignIn}
    variant="outlined"
    sx={{
      padding: 1,
      minWidth: "30px",
      justifyContent: "center",
      alignItems: "center",
      color: theme.palette.common.white,
      border: `1px solid ${theme.palette.common.white}`
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
