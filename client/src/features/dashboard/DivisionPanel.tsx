import {
  Paper,
  Box,
  Stack,
  Container,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import {
  useDivisions,
  useTournament
} from "../viewer/hooks.ts";
import { useContext } from "react";
import { DivisionContext, DivisionDispatchContext } from "../../index.tsx";

function DivisionPanel({ children }) {
  const { data: tournament } = useTournament("current");
  const { data: divisions } = useDivisions(tournament?.id);

  const division = useContext(DivisionContext);
  const dispatch = useContext(DivisionDispatchContext);

  const handleDivisionChange = (event, name) => {
    const id = divisions.findIndex((d) => d.name === name);
    dispatch(id);
  };

  return (
    <Box sx={{padding: 2, border: "solid 1px red", borderRadius: 2}}>

      <Stack spacing={2}>

        <ToggleButtonGroup
          exclusive
          value={division?.name}
          onChange={handleDivisionChange}
          sx={{ height: "45px" }}
        >
          {divisions?.map((d) => (
            <ToggleButton key={d.id} value={d.name}>
              {d.name}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {children}
      </Stack>
    </Box>
  );
}

export default DivisionPanel;
