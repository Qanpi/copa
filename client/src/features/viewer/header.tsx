import { BugReport, GitHub, Menu as MenuIcon } from "@mui/icons-material";
import {
  Box,
  ClickAwayListener,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { ReactNode, useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../user/hooks.ts";
import UserPanel from "../user/userpanel.tsx";
import { useTournament } from "../tournament/hooks.ts";
import logo from "./copa.png";
import AllTeams from "../team/AllTeams.tsx";
import HallOfFame from "./AllTimePage.tsx";
import packageJson from "../../../package.json"
import { ChangeLogContext } from "./ChangeLog.tsx";
import { setNextOpponent } from "brackets-manager/dist/helpers";
import NotificationDrawer from "./NotificationDrawer.tsx";

export const DropdownMenu = ({ anchor, children, triangleRight }: { anchor: ReactNode, children: ReactNode, triangleRight?: string | number }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const handleDropdownOpen = (e) => {
    setOpen(true);
  }


  const handleDropdownClose = (e) => {
    setOpen(false);
  };

  const theme = useTheme();

  return (
    <ClickAwayListener onClickAway={handleDropdownClose}>
      <Box
        onMouseLeave={handleDropdownClose}
        onMouseEnter={handleDropdownOpen}
        sx={{
          height: "100%"
        }}
      >
        <Box
          onClick={handleDropdownOpen}
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
                  top: -7,
                  right: triangleRight,
                  width: 0,
                  height: 0,
                  zIndex: 50,
                  borderLeft: "7px solid transparent",
                  borderRight: "7px solid transparent",
                  borderBottom: `7px solid ${theme.palette.primary.main}`,
                }
              }
            > </Box>

            < Paper
              onClick={handleDropdownClose}
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

  const toggleChangelog = useContext(ChangeLogContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const { data: user } = useAuth();
  const isAdmin = user?.role === "admin";

  const links = [
    <Link to="/" >
      <MenuItem>Home</MenuItem>
    </Link>,
    <Link to="/tournament/dashboard" >
      {isAdmin ?
        <MenuItem>Dashboard</MenuItem> : null}
    </Link>,
    <Link to="/hall-of-fame">
      <MenuItem>Hall of Fame</MenuItem>
    </Link>,
    <Link to="https://github.com/Qanpi/copa">
      <MenuItem>
        <GitHub sx={{mr: 1}}></GitHub>
        About
      </MenuItem>
    </Link>,
  ]

  const tournamentHeader = (
    <MenuItem>
      {tournament?.name || "Tournament"}
    </MenuItem>
  );

  const tournamentSublinks = [
    <Link to="/tournament/participants" >
      <MenuItem>Participants</MenuItem>
    </Link>,
    < Link to="/tournament/matches" >
      <MenuItem>Matches</MenuItem>
    </Link>,
    < Link to="/tournament/groups" >
      <MenuItem>Group stage</MenuItem>
    </Link>,
    < Link to="/tournament/bracket" >
      <MenuItem>Bracket</MenuItem>
    </Link>,
    < Link to="/tournament/rules" >
      <MenuItem>Rules</MenuItem>
    </Link>,
  ]

  return (
    <Box sx={{ width: "100vw", position: "sticky", zIndex: 12 }}>
      <Box sx={{
        background: theme.palette.secondary.main,
        height: "70px",
        paddingLeft: "190px",
        paddingRight: 3,
        boxShadow: `${alpha(theme.palette.common.black, 0.7)} 0px 0px 10px;`
      }} display="flex" alignItems={"center"}>
        {isMobile ?
          null
          : <Stack direction="row" spacing={"3vw"} sx={{
            height: "100%"
          }} alignItems={"center"}>

            {links[0]}

            <DropdownMenu anchor={tournamentHeader}>
              {tournamentSublinks}
            </DropdownMenu>
            {/* <DropdownMenu anchor={<Typography noWrap>All-time</Typography>}>
              <Link to="/teams">
                <AllTeams></AllTeams>
              </Link>
              <Link to="/hall-of-fame">
                <MenuItem>Hall of Fame</MenuItem>
              </Link>
            </DropdownMenu> */}

            {links.slice((isAdmin ? 1 : 2))}
          </Stack>
        }
        <Box sx={{ ml: "auto", height: "100%", alignItems: "center", display: "flex", gap: "7px" }}>
          <NotificationDrawer></NotificationDrawer>
          {/* <Link to="/bug-report">
            <IconButton size="medium" >
              <BugReport sx={{mr: {xs: -1, md: 1}}}></BugReport>
            </IconButton>
          </Link> */}
          {isMobile ?
            <DropdownMenu anchor={
              <IconButton size="medium">
                <MenuIcon fontSize="large"></MenuIcon>
              </IconButton>
            }>
              {links[0]}
              {tournamentHeader}
              {tournamentSublinks.map((l, i) => (
                <Box sx={{ pl: 2 }} key={i}>{l}</Box>
              ))}
              {links.slice(1)}
            </DropdownMenu> : null}
          <UserPanel></UserPanel>
        </Box>
      </Box>
      <Box sx={{
        background: "none",
        width: "170px",
        borderTop: `40px solid ${theme.palette.secondary.main}`,
        borderRight: "20px solid transparent",
        boxShadow: `${alpha(theme.palette.common.black, 0.7)} 0px 10px 10px -10px;`
      }}></Box>
      <Box sx={{ position: "absolute", height: "110px", width: "170px", top: 0 }}>
        <Link to="/">
          <Box component="img" src={logo} sx={{ position: "absolute", top: "-54%", left: -30, height: "220px", width: "220px" }}>
          </Box>
        </Link>
        <Typography onClick={() => toggleChangelog(true)} sx={{ position: "absolute", bottom: "10px", right: "25px", textAlign: "right" }} color={theme.palette.secondary.dark}>v{packageJson.version}</Typography>
      </Box>
    </Box >
  )
}

export default Header;
