import { Menu as MenuIcon } from "@mui/icons-material";
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
import { ReactNode, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../user/hooks.ts";
import UserPanel from "../user/userpanel.tsx";
import { useTournament } from "./hooks.ts";
import logo from "./copa.png";
import AllTeams from "../team/AllTeams.tsx";
import HallOfFame from "./AllTimePage.tsx";

export const DropdownMenu = ({ anchor, children, triangleRight }: { anchor: ReactNode, children: ReactNode, triangleRight?: string | number }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const handleDropdownToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(o => !o);
  };

  const handleDropdownClose = (e) => {
    setOpen(false);
  };

  const theme = useTheme();

  return (
    <Box
      onMouseLeave={handleDropdownClose}
      onMouseEnter={handleDropdownToggle}
      onClick={handleDropdownToggle}
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

      <ClickAwayListener onClickAway={handleDropdownToggle}>
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
      </ClickAwayListener>
    </Box >
  );
};

function Header() {
  const { data: tournament } = useTournament("current");

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
    <Link to="/about">
      <MenuItem>About</MenuItem>
    </Link>
  ]

  const tournamentHeader = (
    <Typography noWrap>
      {tournament?.name || "Tournament"}
    </Typography>
  );

  const tournamentSublinks = [
    <Link to="/tournament/participants" >
      <MenuItem>Participants</MenuItem>
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
  ]

  return (
    <Box sx={{ width: "100vw", position: "sticky", zIndex: 12 }}>
      <Box sx={{
        background: theme.palette.secondary.main,
        height: "70px",
        paddingLeft: "250px",
        paddingRight: 3,
        boxShadow: `${alpha(theme.palette.common.black, 0.7)} 0px 0px 10px;`
      }} display="flex" alignItems={"center"}>
        {isMobile ?
          null
          : <Stack direction="row" spacing={"5vw"} sx={{
            height: "100%"
          }} alignItems={"center"}>

            {links[0]}

            <DropdownMenu anchor={tournamentHeader}>
              {tournamentSublinks}
            </DropdownMenu>
            <DropdownMenu anchor={<Typography noWrap>All-time</Typography>}>
              {/* <Link to="/teams">
                <AllTeams></AllTeams>
              </Link> */}
              <Link to="/hall-of-fame">
                <MenuItem>Hall of Fame</MenuItem>
              </Link>
            </DropdownMenu>

            {links.slice((isAdmin ? 1 : 2))}
          </Stack>
        }
        <Box sx={{ ml: "auto", height: "100%", alignItems: "center", display: "flex", gap: "10px" }}>
          {isMobile ?
            <DropdownMenu anchor={
              <IconButton size="medium">
                <MenuIcon fontSize="large"></MenuIcon>
              </IconButton>
            }>
              {links[0]}
              <MenuItem>{tournamentHeader}</MenuItem>
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
        width: "200px",
        borderTop: `40px solid ${theme.palette.secondary.main}`,
        borderRight: "20px solid transparent",
        boxShadow: `${alpha(theme.palette.common.black, 0.7)} 0px 10px 10px -10px;`
      }}></Box>
      <Link to="/">
        <Box component="img" src={logo} sx={{ position: "absolute", top: "-50%", left: -10, width: "220px", height: "222px" }}>
        </Box>
      </Link>
    </Box >
  )
}

export default Header;
