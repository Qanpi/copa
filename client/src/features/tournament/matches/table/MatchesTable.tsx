import { Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMatches } from "../hooks.ts";
import { useTournament } from "../../hooks.ts";
import { TMatch } from "@backend/models/match.ts";

export const MatchesTable = ({ matches }: { matches: TMatch[] }) => {
  const { data: tournament } = useTournament("current");
  console.log(tournament)

  const cols: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
    },
    {
      field: "group",
      headerName: "Group",
      valueGetter: (p) => {
        if (tournament?.groups !== undefined) {
          console.log(Array.isArray(tournament.groups))
          return tournament.groups.find((g) => g.id === p.value).name
        }
      },
    },
    {
      field: "round",
      headerName: "Round",
      valueGetter: (p) =>
        tournament?.rounds?.find((r: any) => r.id === p.value).number,
    },
    {
      field: "verboseStatus",
      headerName: "Status",
    },
    {
      field: "stage",
      headerName: "Stage",
      valueGetter: (p) => tournament?.states?.find((s: any) => s.id === p.value).name,
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
