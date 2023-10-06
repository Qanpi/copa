import {
  Box,
  Container,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useUser } from "../../user/hooks.ts";
import UserPanel from "../../user/userMenu/userpanel.js";
import "./header.css";
import { useContext, useRef, useState } from "react";
import { AdminContext } from "../../../index.tsx";

const SectionMenu = ({ title, children }) => {
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
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
        ref={ref}
      >
        <Typography>{title}</Typography>

        <Popper
          open={open}
          anchorEl={ref.current}
          disablePortal
          popperOptions={{
            strategy: "fixed",
          }}
        >
          <Stack alignItems="center">
            <Box
              sx={{
                position: "absolute",
                top: -5,
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderBottom: "5px solid black",
              }}
            ></Box>

            <Paper
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
      </Box>
    </>
  );
};

function Header() {
  const { pathname } = useLocation();

  const isAdmin = useContext(AdminContext);

  return (
    <header>
      <div className="bar">
        <div className="sections">
          <Link to="/">Home</Link>
          <SectionMenu title="Tournament">
            <Link to="/tournament/teams">
              <MenuItem>Teams</MenuItem>
            </Link>
            <Link to="/tournament/matches">
              <MenuItem>Matches</MenuItem>
            </Link>
            <Link to="/tournament/groups">
              <MenuItem>Group Stage</MenuItem>
            </Link>
            <Link to="/tournament/bracket">
              <MenuItem>Bracket</MenuItem>
            </Link>
            <Link to="/tournament/gamblers">
              <MenuItem>Gamblers</MenuItem>
            </Link>
          </SectionMenu>
          {isAdmin ? <Link to="/tournament/dashboard">Dashboard</Link> : null}
          <span>All-time</span>
          <span>Fantasy</span>
          <span>About</span>
        </div>
        <UserPanel></UserPanel>
      </div>
      <div className="extension"></div>
    </header>
  );
}

export default Header;
