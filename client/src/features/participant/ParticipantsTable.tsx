import { TParticipant } from "@backend/models/participant.ts";
import { Box, Card, CardActionArea, CardContent, CardProps, Container, Stack, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { CalendarIcon } from "@mui/x-date-pickers";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { DivisionContext } from "../../index.tsx";
import DivisionPanel from "../dashboard/DivisionPanel.tsx";
import BannerPage from "../viewer/BannerPage.tsx";
import {
  useTournament
} from "../viewer/hooks.ts";
import { useParticipants, useUpdateParticipant } from "./hooks.ts";
import { useDeleteParticipant } from "./registration.tsx";

const ParticipantCard = ({ name, ...props }: CardProps & { name?: string }) => {
  return (
    <Card key={name} sx={{
      minHeight: 200, borderRadius: 3,
      maxHeight: "300px"
    }} {...props}>
      <Link to={`/teams/${name}`}>
        <CardActionArea sx={{
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "left",
        }}>
          <CardContent>
            <Typography>{name}</Typography>
          </CardContent>
        </CardActionArea>
      </Link>
    </Card>
  )
}

function TeamsPage() {
  const { data: tournament } =
    useTournament("current");

  const division = useContext(DivisionContext);

  const { data: participants, status } = useParticipants(
    tournament?.id, {
    division: division?.id
  }
  );

  return (
    <BannerPage title="Teams">
      <Stack spacing={3}>
        <DivisionPanel>
          <Box sx={{minHeight: "600px", width: "100%"}}>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, 250px)",
              gap: 2,
              justifyContent: "center",
              pt: 2,
            }}>
              {tournament?.state === "Registration" ? <Card sx={{
                minHeight: 200, borderRadius: 3,
                maxHeight: "300px"
              }}>
                <Link to="/tournament/register">
                  <CardActionArea sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <CardContent>
                      <Typography>Your team could be here</Typography>
                    </CardContent>
                  </CardActionArea>
                </Link>
              </Card> : null}
              {participants?.map(p => <ParticipantCard name={p?.name}></ParticipantCard>)}
            </Box>
          </Box>
        </DivisionPanel>
      </Stack>
    </BannerPage>
  );
}
// || Array.from(Array(9)).map(_ => {
//                 return <Skeleton width={300} height={200} key={_} variant="rounded"></Skeleton> 
//               }) 

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
