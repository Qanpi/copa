import { Container, Stack, Tooltip, Box, Typography, Card, CardContent, CardActionArea, CardActions, Button } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { CalendarIcon } from "@mui/x-date-pickers";
import { Link, Navigate } from "react-router-dom";
import DivisionPanel from "../dashboard/DivisionPanel.tsx";
import {
  useDivisions,
  useTournament
} from "../viewer/hooks.ts";
import { useParticipants, useUpdateParticipant } from "./hooks.ts";
import { useDeleteParticipant } from "./registration.js";
import { TParticipant } from "@backend/models/participant.ts";
import { useContext } from "react";
import { DivisionContext } from "../../index.tsx";

function TeamsPage() {
  const { data: tournament } =
    useTournament("current");

  const division = useContext(DivisionContext);

  const { data: participants, status: participantsStatus } = useParticipants(
    tournament?.id, {
    division: division?.id
  }
  );


  return (
    <Container sx={{ pt: 10 }} >
      <Stack spacing={3}>
        <Typography variant="h2">Teams participating</Typography>
        <DivisionPanel>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, 300px)",
            gap: 2,
            justifyContent: "center",
            pt: 2
          }}>
            {
              participants?.map(p => {
                return (
                  <Card key={p.id} sx={{
                    minHeight: 200, borderRadius: 3,
                  }}>
                    <Link to={`/teams/${p.name}`}>
                      <CardActionArea sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "left"
                      }}>
                        <CardContent>
                          <Typography>{p.name}</Typography>
                        </CardContent>
                      </CardActionArea>
                    </Link>
                  </Card>
                )
              })
            }
          </Box>
        </DivisionPanel>
      </Stack>
    </Container>
  );
}

function ParticipantsTable({ participants }: { participants: TParticipant[] }) {
  const unregisterTeam = useDeleteParticipant();
  const updateParticipant = useUpdateParticipant();

  const cols: GridColDef[] = [
    {
      field: "name",
      headerName: "Team name",
      width: 200,
      renderCell: (params) => {
        return (
          <Link to={`/teams/${params.row.name}`}>{params.row.name}</Link>
        )
      },
    },
    {
      field: "phoneNumber",
      headerName: "Contact number",
      width: 150,
    },
    {
      field: "createdAt",
      headerName: "Registered",
      type: "dateTime",
      valueGetter: (p) => new Date(p.value),
      width: 200,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: ({ row }) => {
        return [
          <Tooltip title="Unregister">
            <GridActionsCellItem
              onClick={() => unregisterTeam.mutate({ id: row.id })}
              icon={<CalendarIcon></CalendarIcon>}
              label="Revoke registration"
            ></GridActionsCellItem>
          </Tooltip>,
        ];
      },
    },
  ];

  return (
    <DataGrid
      editMode="row"
      isCellEditable={(params) => params.row.tournament === tournament?.id}
      autoHeight
      rows={participants}
      columns={cols}
      processRowUpdate={async (newRow, orig) => {
        const res = await updateParticipant.mutateAsync(newRow);
        return res;
      }}
      onProcessRowUpdateError={(err) => console.log(err)}
    ></DataGrid>
  )
}

export default TeamsPage;
