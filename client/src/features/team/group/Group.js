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
import { isEqual } from "lodash";
import { memo } from "react";
import MyTable from "../../viewer/tables/MyTable.js";

function Group({ name, participants, disableHead }) {
  const teamValueGetter = (params, fieldName) => {
    return params.row.team[fieldName];
  };

  const cols = [
    {
      field: "name",
      headerName: "Team",
    },
    {
      field: "wins",
    },
  ];

  const rows = participants || [];

  return <MyTable title={name} rows={rows} cols={cols} hideFooter></MyTable>;

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
