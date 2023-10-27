import { Google } from "@mui/icons-material";
import {Skeleton, Stack, Box, Button, Theme, Typography, useMediaQuery, MenuItem, Menu, Breakpoint, ButtonProps, useTheme, Avatar } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth, userKeys } from "./hooks.ts";
import { DropdownMenu } from "../viewer/header.tsx";

function UserPanel() {
  const { isLoading, data: user } = useAuth();
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

  if(isLoading) return <Skeleton variant="rounded" sx={{width: "8vw", height: "48px"}}></Skeleton>

  return user ? (
    <DropdownMenu anchor={
      <Stack direction="row" display={"flex"} alignItems="center" spacing={1}>
        <Avatar src={user.avatar} variant="rounded" sx={{width: "48px", height: "48px"}}></Avatar>
        {minified ? null : <Typography>{user.name}</Typography>}
      </Stack>
    } triangleRight="28%">
      <Link to={`/users/${user.id}`}>
        <MenuItem>Profile</MenuItem>
      </Link>
      <Link to={user.team?.name ? `/teams/${encodeURIComponent(user.team.name)}` : "/team/none"}>
        <MenuItem>My team</MenuItem>
      </Link>
      <MenuItem onClick={_ => logout.mutate()}>Sign out</MenuItem>
    </DropdownMenu>
  ) : (
    <GoogleSignInButton breakpoint={"md"}></GoogleSignInButton>
  );
}

export const GoogleSignInButton = ({ breakpoint, sx, ...props } : { breakpoint?: Breakpoint | number } & ButtonProps) => {
  const handleSignIn = () => {
    window.open(`/login/federated/google`, "_self");
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
      border: `1px solid ${theme.palette.common.white}`,
      ...sx
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
