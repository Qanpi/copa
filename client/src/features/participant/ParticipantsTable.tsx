import { TParticipant } from "@backend/models/participant.ts";
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, CardProps, Container, IconButton, Skeleton, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { CalendarIcon } from "@mui/x-date-pickers";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { DivisionContext } from "../../index.tsx";
import DivisionPanel from "../layout/DivisionPanel.tsx";
import BannerPage from "../viewer/BannerPage.tsx";
import {
  useTournament
} from "../tournament/hooks.ts";
import { useParticipants, useUpdateParticipant } from "./hooks.ts";
import { useDeleteParticipant } from "./registration.tsx";
import { AddCircle } from "@mui/icons-material";
import { PromptContainer } from "../layout/PromptContainer.tsx";

const ParticipantCard = ({ name, banner, ...props }: CardProps & { name: string, banner?: string }) => {
  const theme = useTheme();

  return (
    <Card key={name} sx={{
      minHeight: 200, borderRadius: 1,
      background: theme.palette.primary.dark,
      maxWidth: 400
    }} {...props}>
      <Link to={`/teams/${encodeURIComponent(name)}`}>
        <CardActionArea sx={{
          height: "100%",
          display: "flex",
          alignItems: "start",
          flexDirection: "column"
        }}>
          <CardMedia image={banner} sx={{ height: "100%", width: "100%" }}>
          </CardMedia>
          <CardContent>
            <Typography>{name}</Typography>
          </CardContent>
        </CardActionArea>
      </Link>
    </Card>
  )
}

function TeamsPage() {
  const { data: tournament, isLoading: isTournamentLoading } =
    useTournament("current");

  const division = useContext(DivisionContext);

  const { data: participants, status, isLoading } = useParticipants(
    tournament?.id, {
    division: division?.id
  }
  );

  const theme = useTheme();
  const from = tournament?.registration?.from;

  return (
    <BannerPage title={`Participants`}>
      <Stack spacing={3}>
        <DivisionPanel>
          {from && new Date(from) <= new Date() ? <Box sx={{ minHeight: "600px", width: "100%" }}>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: 2,
              justifyContent: "center",
              p:2 
            }}>

              {isLoading ? <>
                {Array.from({ length: 20 }, (_, i) => <Skeleton variant="rounded" key={i} sx={{ width: "100%", height: "200px" }}></Skeleton>)}
              </> : null}
              {participants?.map(p => <ParticipantCard name={p.name} banner={p.team?.bannerUrl}></ParticipantCard>)}
            </Box>
          </Box> :
            <PromptContainer sx={{minHeight: "60vh"}}>
              <Typography>{isTournamentLoading ? "" : "Registration hasn't begun yet"}</Typography>
            </PromptContainer> 
          }
        </DivisionPanel>
      </Stack>
    </BannerPage>
  );
}
// || Array.from(Array(9)).map(_ => {
//                 return <Skeleton width={300} height={200} key={_} variant="rounded"></Skeleton> 
//               }) 

function ParticipantsTable({ participants }: { participants: TParticipant[] }) {
  const { data: tournament } = useTournament("current");

  const unregisterTeam = useDeleteParticipant();
  const updateParticipant = useUpdateParticipant();

  const cols: GridColDef[] = [
    {
      field: "name",
      headerName: "Team name",
      width: 200,
      renderCell: (params) => {
        return (
          <Link to={`/teams/${encodeURIComponent(params.row.name)}`}>{params.row.name}</Link>
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
      onProcessRowUpdateError={(err) => console.error(err)}
    ></DataGrid>
  )
}

export default TeamsPage;
