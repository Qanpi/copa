import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import MyTable from "../../viewer/tables/MyTable";

function Group({ name, participations, disableHead }) {
  const teamValueGetter = (params, fieldName) => {
    return params.row.team[fieldName];
  };

  const cols = [
    {
      field: "name",
      headerName: "Team",
      valueGetter: (p) => teamValueGetter(p, "name"),
    },
    {
      field: "wins",
    }
  ];

  return <MyTable rows={participations} cols={cols}></MyTable>;

  return (
    <div>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography variant="h6">Group {name}</Typography>
              </TableCell>
            </TableRow>
            {!disableHead ? (
              <TableRow>
                <TableCell>Standing</TableCell>
                <TableCell>Team name</TableCell>
                <TableCell>W</TableCell>
                <TableCell>L</TableCell>
                <TableCell>D</TableCell>
              </TableRow>
            ) : null}
          </TableHead>
          <TableBody>
            {participations.map((p, i) => (
              <TableRow key={i}>
                <TableCell>{i + 1}.</TableCell>
                <TableCell>{p.team.name}</TableCell>
                <TableCell>{p.wins}</TableCell>
                <TableCell>{p.losses}</TableCell>
                <TableCell>{p.draws}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default Group;
