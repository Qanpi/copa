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
import { DataGrid } from "@mui/x-data-grid";
import { isEqual } from "lodash";
import { memo } from "react";

function Group({ name, participants, disableHead }) {
  const cols = [
    {
      field: "name",
      headerName: name 
    },
  ];

  const rows = participants || [];

  return <DataGrid rows={rows} columns={cols} hideFooter></DataGrid>;

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
            {participants.map((p, i) => (
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

export default memo(Group, (prev, next) => {
  // const diff = differenceWith(prev.participants, next.participants, isEqual);
  return isEqual(prev, next);
});
