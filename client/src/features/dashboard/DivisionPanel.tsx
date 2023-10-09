import {
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import {
  useDivisions,
  useTournament
} from "../tournament/hooks.ts";
import { useContext } from "react";
import { DivisionContext, DivisionDispatchContext } from "../../index.tsx";

function DivisionPanel({ children  }) {
  const { data: tournament } = useTournament("current");
  const { data: divisions } = useDivisions(tournament?.id);

  const division = useContext(DivisionContext);
  const dispatch = useContext(DivisionDispatchContext);

  const handleDivisionChange = (event, name) => {
    const id = divisions.findIndex((d) => d.name === name);
    dispatch(id);
  };

  return (
    <>
      <ToggleButtonGroup
        exclusive
        value={division?.name}
        onChange={handleDivisionChange}
      >
        {divisions?.map((d) => (
          <ToggleButton key={d.id} value={d.name}>
            {d.name}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {children}
    </>
  );
}

export default DivisionPanel;
