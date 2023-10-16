import {
  Paper,
  Box,
  Stack,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  useTheme
} from "@mui/material";
import {
  useDivisions,
  useTournament
} from "../viewer/hooks.ts";
import { ReactNode, useContext } from "react";
import { DivisionContext, DivisionDispatchContext } from "../../index.tsx";

function DivisionPanel({ children }: {children?: ReactNode}) {
  const { data: tournament } = useTournament("current");
  const { data: divisions } = useDivisions(tournament?.id);

  const division = useContext(DivisionContext);
  const dispatch = useContext(DivisionDispatchContext);

  const handleDivisionChange = (event, name) => {
    const id = divisions.findIndex((d) => d.name === name);
    dispatch(id);
  };

  const theme = useTheme();

  return (
    <Box sx={{padding: 2, border: `1px solid ${theme.palette.primary.main}`, borderRadius: 2}}>

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
