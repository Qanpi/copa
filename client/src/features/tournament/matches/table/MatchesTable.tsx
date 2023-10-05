import { Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMatches, useUpdateMatch } from "../hooks.ts";
import { useTournament } from "../../hooks.ts";
import { useParticipants } from "../../../participant/hooks.ts";
import { notStrictEqual } from "assert";
import { TMatch } from "@backend/models/match.ts";

export const MatchesTable = () => {
  const { data: tournament } = useTournament("current");
  const { data: matches } = useMatches();
  const { data: participants } = useParticipants();

  const updateMatch = useUpdateMatch();

  const cols: GridColDef[] = [
    {
      field: "start",
      headerName: "Date",
      editable: true,
      type: "dateTime",
      // valueGetter({row}) {
      //   return undefined;
      // },
      // valueSetter({value, row}) {
      //   return row;
      // },
      // valueParser(value, params) {
      //   return new Date(value);
      // },
      // valueSetter(params) {
      //     console.log(params)
      // },
    },
    {
      field: "opponent1",
      headerName: "Home",
      valueGetter: (p) => {
        const participant = participants?.find(part => part.id === p.value.id);
        return participant?.name;
      }
    },
    {
      field: "opponent2",
      headerName: "Away",
      valueGetter: (p) => {
        const participant = participants?.find(part => part.id === p.value.id);
        return participant?.name;
      }
    },
    {
      field: "group_id",
      headerName: "Group",
      valueGetter: (p) => {
        const group = tournament?.groups.find((g) => g.id === p.value)
        return group?.name;
      },
    },
    {
      field: "round_id",
      headerName: "Round",
      valueGetter: (p) => {
        const round = tournament?.rounds.find((g) => g.id === p.value)
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
        const state = tournament?.stages.find((g) => g.id === p.value)
        return state?.name;
      }
    },
  ];

  if (!matches) return <>LOading</>;

  const handleRowUpdate = async (newRow: TMatch, og: TMatch) => {
    const res = await updateMatch.mutateAsync(newRow);
    return res;
  }

  return <DataGrid rows={matches} columns={cols} processRowUpdate={handleRowUpdate}></DataGrid>;
};

function MatchesPage() {

  return (
    <>
      <MatchesTable></MatchesTable>
      <Typography>Matches</Typography>
    </>
  );
}

export default MatchesPage;
