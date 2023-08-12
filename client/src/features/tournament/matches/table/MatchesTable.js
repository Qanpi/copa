import { Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useMatches } from "../../../viewer/home/Home";
import { useTournament } from "../../../..";

function MatchesTable() {
  const { data: matches } = useMatches();
  const {data: tournament} = useTournament("current");

  const cols = [
    {
      field: "date",
      headerName: "Date",
    },
    {
        field: "group",
        headerName: "Group",
        valueGetter: (p) => tournament?.groups.find(g => g.id === p.value).name
    },
    {
        field: "round",
        headerName: "Round"
    },
    {
        field: "verboseStatus",
        headerName: "Status"
    },
    {
        field: "stage",
        headerName: "Stage",
        valueGetter: (p) => tournament?.stages.find(s => s.id === p.value).name
    }
  ];

  if (!matches) return <div>Loading...</div>;
  return (
    <>
      <Typography>Matches</Typography>
      <DataGrid editMode="row" rows={matches} columns={cols}></DataGrid>
    </>
  );
}

export default MatchesTable;
