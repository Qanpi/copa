import { Typography } from "@mui/material";
import { useMatches, useUpdateMatch } from "./hooks.ts";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTournament } from "../viewer/hooks.ts";
import { useParticipants } from "../participant/hooks.ts";
import { notStrictEqual } from "assert";
import { TMatch } from "@backend/models/match.ts";
import { useGroups } from "../group/hooks.ts";
import { useStages } from "../stage/hooks.ts";
import { useRounds } from "../round/hooks.ts";

export const MatchesTable = () => {
  const { data: tournament } = useTournament("current");
  const { data: matches } = useMatches(tournament?.id);
  const { data: participants } = useParticipants(tournament?.id);

  const {data: groups} = useGroups(tournament?.id);
  const {data: rounds} = useRounds(tournament?.id);
  const {data: stages} = useStages(tournament?.id);

  const updateMatch = useUpdateMatch();

  const cols: GridColDef[] = [
    {
      field: "start",
      headerName: "Date",
      editable: true,
      type: "date",
      valueGetter({ value }) {
        return value ? new Date(value) : undefined;
      },
    },
    {
      field: "opponent1",
      headerName: "Home",
      valueGetter: (p) => {
        if (p.value === null) return "BYE";

        const participant = participants?.find(part => part.id === p.value.id);
        return participant?.name || "TBD";
      }
    },
    {
      field: "opponent2",
      headerName: "Away",
      valueGetter: (p) => {
        if (p.value === null) return "BYE";

        const participant = participants?.find(part => part.id === p.value.id);
        return participant?.name || "TBD";
      }
    },
    {
      field: "group_id",
      headerName: "Group",
      valueGetter: (p) => {
        const group = groups?.find((g) => g.id === p.value)
        return group?.name;
      },
    },
    {
      field: "round_id",
      headerName: "Round",
      valueGetter: (p) => {
        const round = rounds?.find((g) => g.id === p.value)
        return round?.number;
      }
    },
    {
      field: "verboseStatus",
      headerName: "Status",
    },
    {
      field: "stage_id",
      headerName: "Stage",
      valueGetter: (p) => {
        const stage = stages?.find((g) => g.id === p.value)
        return stage?.name;
      }
    },
  ];

  if (!matches) return <>LOading</>;

  const handleRowUpdate = (newRow: TMatch, og: TMatch) => {
    updateMatch.mutate(newRow);
    return newRow;
  }

  //FIXME: better error handling
  return <DataGrid rows={matches} columns={cols} processRowUpdate={handleRowUpdate} onProcessRowUpdateError={(err) => console.error(err)}></DataGrid>;
};
