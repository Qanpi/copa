import { Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMatches } from "../hooks";
import { useTournament } from "../../hooks";

export const MatchesTable = ({matches} : {matches: any[]}) => {
  const { data: tournament } = useTournament("current");

  const cols: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
    },
    {
      field: "group",
      headerName: "Group",
      valueGetter: (p) => tournament?.groups.find((g: any) => g.id === p.value).name,
    },
    {
      field: "round",
      headerName: "Round",
      valueGetter: (p) =>
        tournament?.rounds.find((r: any) => r.id === p.value).number,
    },
    {
      field: "verboseStatus",
      headerName: "Status",
    },
    {
      field: "stage",
      headerName: "Stage",
      valueGetter: (p) => tournament?.stages.find((s: any) => s.id === p.value).name,
    },
  ];

  return <DataGrid editMode="row" rows={matches} columns={cols}></DataGrid>;
};

function MatchesPage() {
  const { data: matches } = useMatches();

  if (!matches) return <div>Loading...</div>;
  return (
    <>
      <MatchesTable matches={matches}></MatchesTable>
      <Typography>Matches</Typography>
    </>
  );
}

export default MatchesPage;
