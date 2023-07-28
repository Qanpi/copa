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

function Group({ teams, disableHead}) {
  return (
    <div>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography variant="h6">Group A</Typography>
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
            {teams.map((t, i) => (
              <TableRow>
                <TableCell>{i + 1}.</TableCell>
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.wins}</TableCell>
                <TableCell>{t.losses}</TableCell>
                <TableCell>{t.draws}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default Group;
