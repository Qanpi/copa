import { Button, InputLabel, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { CalendarIcon } from "@mui/x-date-pickers";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { Formik, Form } from "formik";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import { useParticipants } from "./hooks.ts";
import {
  useDivisions,
  useTournament,
  useUpdateTournament,
} from "../viewer/hooks.ts";
import { useDeleteParticipant } from "./registration.js";
import MyDatePicker from "../inputs/MyDatePicker.js";
import DivisionPanel from "../dashboard/DivisionPanel.tsx";
import { useContext } from "react";
import { DivisionContext } from "../../index.tsx";

function TeamsPage() {
  const { data: tournament, status: tournamentStatus } =
    useTournament("current");

  const division = useContext(DivisionContext);
  const { data: participants, status: participantsStatus } = useParticipants(
    tournament?.id, {
      division: division?.id
    }
  );
  const { data: divisions } = useDivisions(tournament?.id);
  const unregisterTeam = useDeleteParticipant();

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
      field: "division",
      headerName: "Division",
      editable: true,
      type: "singleSelect",
      valueOptions: divisions?.map(d => d.name),
      valueGetter: ({ value }) => {
        return divisions?.find(d => d.id === value)?.name;
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
  const updateTournament = useUpdateTournament(tournament?.id);

  const updateParticipation = useMutation({
    mutationFn: async (values) => {
      const res = await axios.put(`/api/participations/${values.id}`, values);
      return res.data;
    },
  });

  if (participantsStatus !== "success") return <p>Loading...</p>;

  if (tournamentStatus !== "success") return <p>Loading...</p>;

  return (
    <div sx={{ width: "80%" }}>
      <Typography>Teams</Typography>

      <DivisionPanel>

        <DataGrid
          editMode="row"
          isCellEditable={(params) => params.row.tournament === tournament?.id}
          autoheight
          rows={participants}
          columns={cols}
          processRowUpdate={async (newRow, orig) => {
            const res = await updateParticipation.mutateAsync(newRow);
            return res;
          }}
          onProcessRowUpdateError={(err) => console.log(err)}
        ></DataGrid>
      </DivisionPanel>
    </div>
  );
}

export default TeamsPage;
