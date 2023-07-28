import { Tooltip } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { CalendarIcon } from "@mui/x-date-pickers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { useTournament } from "../../../..";
import { useParticipations } from "../MyTable";
import { useUnregisterTeam } from "../../../team/registration/registration";
import MyTable from "../MyTable";

function TeamsTable() {
  const {data: participations, status: participationsStatus} = useParticipations();
  const unregisterTeam = useUnregisterTeam();
  const {data: tournament} = useTournament("current");

  const teamValueGetter = (params, fieldName) => {
    return params.row.team[fieldName];
  };

  const teamValueSetter = (fieldName) => {
    return (p) => {
      const team = p.row.team;
      team[fieldName] = p.value;

      const row = { team, ...p.row };
      return row;
    };
  };

  const cols = [
    {
      field: "id",
      headerName: "ID",
      valueGetter: (p) => teamValueGetter(p, "id"),
    },
    {
      field: "name",
      headerName: "Team name",
      width: 200,
      valueGetter: (p) => teamValueGetter(p, "name"),
      //is encoding fine?
      renderCell: (params) => (
        <Link to={`/teams/${params.row.team.name}`}>{params.value}</Link>
      ),
    },
    {
      field: "division",
      headerName: "Division",
      editable: true,
      valueOptions: tournament?.divisions,
      type: "singleSelect",
      valueGetter: (p) => teamValueGetter(p, "division"),
      valueSetter: teamValueSetter("division"),
    },
    {
      field: "phoneNumber",
      headerName: "Contact number",
      width: 150,
      valueGetter: (params) => teamValueGetter(params, "phoneNumber"),
    },
    {
      field: "createdAt",
      headerName: "Registered",
      type: "dateTime",
      width: 200,
      valueGetter: (params) => dayjs(params.row.createdAt).toDate(),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: (params) => {
        return [
          <Tooltip title="Unregister">
            <GridActionsCellItem
              onClick={() => unregisterTeam.mutate({id: params.row.id})}
              icon={<CalendarIcon></CalendarIcon>}
              label="Revoke registration"
            ></GridActionsCellItem>
          </Tooltip>,
        ];
      },
    },
  ];

  if (participationsStatus !== "success") return <p>Loading...</p>
  return <MyTable rows={participations} cols={cols}></MyTable>;
}

export default TeamsTable;
