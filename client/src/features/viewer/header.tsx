import { Menu as MenuIcon } from "@mui/icons-material";
import {
  Backdrop,
  BackdropProps,
  Box,
  CircularProgress,
  ClickAwayListener,
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

export const DropdownMenu = ({ anchor, children, triangleRight }: { anchor: ReactNode, children: ReactNode, triangleRight?: string | number }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const handlerDropdownOpen = (e) => {
    setOpen(true);
  };

  const handleDropdownClose = (e) => {
    setOpen(false);
  };

  const theme = useTheme();

  return (
    <ClickAwayListener onClickAway={handleDropdownClose}>
      <Box
        onMouseLeave={handleDropdownClose}
        onMouseEnter={handlerDropdownOpen}
        onClick={handlerDropdownOpen}
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
                  right: triangleRight,
                  width: 0,
                  height: 0,
                  borderLeft: "15px solid transparent",
                  borderRight: "15px solid transparent",
                  borderBottom: `15px solid ${theme.palette.primary.main}`,
                }
              }
            > </Box>

            < Paper
              elevation={0}
              square
              sx={{
                background: theme.palette.primary.main,
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
    </ClickAwayListener>
  );
};

function Header() {
  const { data: tournament } = useTournament("current");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const { data: user } = useUser("me");

  const links = [
    <Link to="/" >Home</Link>,
    <Link to="/all-time">
      <Typography>
        All-time
      </Typography>
    </Link>,
    <Link to="/about">
      <Typography>
        About
      </Typography>
    </Link>
  ]

  const tournamentLink = (
    <Link to="/tournament">
      <Typography>
        {tournament?.name || "Tournament"}
      </Typography>
    </Link>
  );

  const tournamentSublinks = [
    <Link to="/tournament/teams" >
      <MenuItem>Teams </MenuItem>
    </Link>,
    < Link to="/tournament/matches" >
      <MenuItem>Matches </MenuItem>
    </Link>,
    < Link to="/tournament/groups" >
      <MenuItem>Group stage </MenuItem>
    </Link>,
    < Link to="/tournament/bracket" >
      <MenuItem>Bracket </MenuItem>
    </Link>,
    < Link to="/tournament/gamblers" >
      <MenuItem>Gamblers </MenuItem>
    </Link>
  ]

  return (
    <Box sx={{ width: "100vw", position: "sticky", zIndex: 12 }}>
      <Box sx={{
        background: theme.palette.secondary.main,
        height: "70px",
        paddingLeft: "250px",
        paddingRight: 3
      }} display="flex" alignItems={"center"}>
        {isMobile ?
          null
          : <Stack direction="row" spacing={"7vw"} sx={{
            height: "100%"
          }} alignItems={"center"}>

            {links[0]}

            <DropdownMenu anchor={tournamentLink}>
              {tournamentSublinks}
            </DropdownMenu>

            {user?.role === "admin" ?
              (
                <Link to="/tournament/dashboard">
                  <Typography>Dashboard</Typography>
                </Link>
              ) : null
            }

            {links.slice(1)}
          </Stack>
        }
        <Box sx={{ ml: "auto", height: "100%", alignItems: "center", display: "flex", gap: "10px" }}>
          {isMobile ?
            <DropdownMenu anchor={
              <IconButton size="medium">
                <MenuIcon fontSize="large"></MenuIcon>
              </IconButton>
            }>
              <MenuItem>{links[0]}</MenuItem>
              <MenuItem>{tournamentLink}</MenuItem>
              {links.slice(1).map((l, i) => (
                <MenuItem key={i}>{l}</MenuItem>
              ))}
            </DropdownMenu> : null}
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
