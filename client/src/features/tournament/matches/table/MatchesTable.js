import { Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useMatches } from "../../../viewer/home/Home";
import { useTournament } from "../../../..";

export const MatchesTable = ({matches}) => {
  const { data: tournament } = useTournament("current");

  const cols = [
    {
      field: "date",
      headerName: "Date",
    },
    {
      field: "group",
      headerName: "Group",
      valueGetter: (p) => tournament?.groups.find((g) => g.id === p.value).name,
    },
    {
      field: "round",
      headerName: "Round",
      valueGetter: (p) =>
        tournament?.rounds.find((r) => r.id === p.value).number,
    },
    {
      field: "verboseStatus",
      headerName: "Status",
    },
    {
      field: "stage",
      headerName: "Stage",
      valueGetter: (p) => tournament?.stages.find((s) => s.id === p.value).name,
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
