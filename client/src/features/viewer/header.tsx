import {
  Box,
  Container,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Stack,
  Typography,
  Menu,
  useTheme,
  useMediaQuery,
  IconButton
} from "@mui/material";
import { ReactNode, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../user/hooks.ts";
import UserPanel from "../user/userMenu/userpanel.tsx";
import { Menu as MenuIcon } from "@mui/icons-material";
// import "./header.css";

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
  const { pathname } = useLocation();

  const { data: user } = useUser("me");
  const isAdmin = user?.role === "admin";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <Box sx={{ width: "100vw", position: "sticky", zIndex: 12 }}>
      <Box sx={{
        background: theme.palette.secondary.main,
        height: "50px",
        paddingLeft: "270px",
        paddingRight: 3
      }} display="flex" alignItems={"center"}>
        {isMobile ?
          null
          : <Stack direction="row" spacing={"7vw"} sx={{
            height: "100%"
          }} alignItems={"center"}>
            <Link to="/" > Home </Link>

            <DropdownMenu anchor={
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
            </DropdownMenu>

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
        borderTop: `50px solid ${theme.palette.secondary.main}`,
        borderRight: "40px solid transparent",
      }}></Box>
    </Box >
  )

  return (
    <header>
      <div className="bar" >
        <div className="sections" >
          <Link to="/" > Home </Link>
          < DropdownMenu title="Tournament" >
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
          </DropdownMenu>
          {
            isAdmin ? <Link to="/tournament/dashboard" > Dashboard </Link> : null}
          < span > All - time </span>
          < span > Fantasy </span>
          < span > About </span>
        </div>
        < UserPanel > </UserPanel>
      </div>
      < div className="extension" > </div>
    </header>
  );
}

export default Header;
