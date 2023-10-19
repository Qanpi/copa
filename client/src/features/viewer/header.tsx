import { Menu as MenuIcon } from "@mui/icons-material";
import {
  Backdrop,
  BackdropProps,
  Box,
  CircularProgress,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { ReactNode, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../user/hooks.ts";
import UserPanel from "../user/userpanel.tsx";
import { useTournament } from "./hooks.ts";

export const DropdownMenu = ({ anchor, children }: { anchor: ReactNode, children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const handlePointerEnter = (e) => {
    setOpen(true);
  };

  const handlePointerLeave = (e) => {
    setOpen(false);
  };

  return (
    <>
      <Box
        onPointerLeave={handlePointerLeave}
        onPointerEnter={handlePointerEnter}
        sx={{
          height: "100%"
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%"
          }}
          ref={ref}
        >
          {anchor}
        </Box>


        <Popper
          open={open}
          anchorEl={ref.current}
          disablePortal
          popperOptions={{
            strategy: "fixed",
          }}
        >
          <Stack alignItems="center" >
            <Box
              sx={
                {
                  position: "absolute",
                  top: -5,
                  width: 0,
                  height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderBottom: "5px solid black",
                }
              }
            > </Box>

            < Paper
              elevation={0}
              square
              sx={{
                bgcolor: "red",
                minWidth: "150px",
              }}
            >
              <MenuList>
                {children}
              </MenuList>
            </Paper>
          </Stack>
        </Popper>
      </Box >
    </>
  );
};

function Header() {
  const { data: tournament } = useTournament("current");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const { data: user } = useUser("me");
  console.log(user);

  return (
    <Box sx={{ width: "100vw", position: "sticky", zIndex: 12 }}>
      <Box sx={{
        background: theme.palette.secondary.main,
        height: "70px",
        paddingLeft: "270px",
        paddingRight: 3
      }} display="flex" alignItems={"center"}>
        {isMobile ?
          null
          : <Stack direction="row" spacing={"7vw"} sx={{
            height: "100%"
          }} alignItems={"center"}>
            <Link to="/" > Home </Link>

            {tournament?.state ? <DropdownMenu anchor={
              <Typography>
                Tournament
              </Typography>
            }>
              <Link to="/tournament/teams" >
                <MenuItem>Teams </MenuItem>
              </Link>
              < Link to="/tournament/matches" >
                <MenuItem>Matches </MenuItem>
              </Link>
              < Link to="/tournament/groups" >
                <MenuItem>Group Stage </MenuItem>
              </Link>
              < Link to="/tournament/bracket" >
                <MenuItem>Bracket </MenuItem>
              </Link>
              < Link to="/tournament/gamblers" >
                <MenuItem>Gamblers </MenuItem>
              </Link>
            </DropdownMenu> : null}

            {user?.role === "admin" ?
              (
                <Link to="/tournament/dashboard">
                  <Typography>Dashboard</Typography>
                </Link>
              ) : null
            }

            <Link to="/all-time">
              <Typography>
                All-time
              </Typography>
            </Link>
            <Link to="/about">
              <Typography>
                About
              </Typography>
            </Link>
          </Stack>
        }
        <Box sx={{ ml: "auto", height: "100%", alignItems: "center", display: "flex" }}>
          {isMobile ? <IconButton sx={{ mr: 1 }}>
            <MenuIcon></MenuIcon>
          </IconButton> : null}
          <UserPanel></UserPanel>
        </Box>
      </Box>
      <Box sx={{
        background: "none",
        width: "200px",
        borderTop: `40px solid ${theme.palette.secondary.main}`,
        borderRight: "20px solid transparent",
      }}></Box>
    </Box >
  )
}

export const LoadingBackdrop = (props: BackdropProps) => {
  return <Backdrop sx={{ zIndex: 11 }} {...props}>
    <CircularProgress></CircularProgress>
  </Backdrop>
}

export default Header;
