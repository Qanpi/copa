import {
  Paper,
  Box,
  Stack,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  Typography
} from "@mui/material";
import {
  useDivisions,
  useTournament
} from "../viewer/hooks.ts";
import { ReactNode, useContext } from "react";
import { DivisionContext, DivisionDispatchContext } from "../../index.tsx";

function DivisionPanel({ children }: { children?: ReactNode }) {
  const { data: tournament, status } = useTournament("current");
  const { data: divisions } = useDivisions(tournament?.id);

  const division = useContext(DivisionContext);
  const dispatch = useContext(DivisionDispatchContext);

  const handleDivisionChange = (_, name: string) => {
    if (!divisions || !name) return;

    const id = divisions.findIndex((d) => d.name === name);
    dispatch(id);
  };

  const theme = useTheme();

  if (status === "success" && !divisions) return <Container sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "10vh" }}>
    <Typography>Come back here when the tournament begins.</Typography>
  </Container>;

  return (
    <Box sx={{ padding: 2, border: `1px solid ${theme.palette.primary.main}`, borderRadius: 2 }}>

      <Stack spacing={2}>

        <ToggleButtonGroup
          exclusive
          value={division?.name}
          onChange={handleDivisionChange}
          sx={{ height: "45px", zIndex: 11 }}
        >
          {divisions?.map((d) => (
            <ToggleButton key={d.id} value={d.name as string}>
              {d.name}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Box display="flex" justifyContent="center">
          {children}
        </Box>
      </Stack>
    </Box>
  );
}

export default DivisionPanel;
