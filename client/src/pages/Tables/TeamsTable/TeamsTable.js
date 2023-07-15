import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import axios from "axios";
import { useContext } from "react";
import { AuthContext, TeamContext, TournamentContext } from "../../..";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { StepIcon, Tooltip } from "@mui/material";
import { CalendarIcon } from "@mui/x-date-pickers";
import { Link } from "react-router-dom";

const useTableQuery = (queryKey) => {
  const { status, data } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await axios.get(`/api/${queryKey}`);
      return res.data;
    },
  });

  return [status, data];
};

function TeamsTable() {
  const [tournamentStatus, tournament] = useCurrentTournament();;
  const queryClient = useQueryClient();

  const { status, data: participations } = useQuery({
    queryKey: ["participations"],
    queryFn: async () => {
      const res = await axios.get(`/api/participations`);
      return res.data; 
    },
  });

  //FIXME: repetitive code -> extract to hook
  const unregisterTeam = useMutation({
    mutationFn: async (values) => {
      console.log(values);
      const res = await axios.delete(`/api/participations/${values.row.id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["participations"]);
    },
  });

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

  const adminCols = [
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
      valueOptions: tournament.divisions,
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
              onClick={() => unregisterTeam.mutate(params)}
              icon={<CalendarIcon></CalendarIcon>}
              label="Revoke registration"
            ></GridActionsCellItem>
          </Tooltip>,
        ];
      },
    },
  ];

  if (status === "loading") return <p>Loading...</p>;

  return <Table rows={participations} adminCols={adminCols}></Table>;
}

const Table = ({ rows, userCols, adminCols }) => {
  const [userStatus, user] = useCurrentUser();
  const [tournamentStatus, tournament] = useCurrentTournament();

  const cols = user.role === "admin" ? adminCols : userCols;
  const props = user.role === "admin" ? {} : {};

  const updateParticipation = useMutation({
    mutationFn: async (values) => {
      const res = await axios.put(`/api/participations/${values.id}`, values);
      return res.data;
    },
  });

  return (
    <div style={{ width: "80%" }}>
      <DataGrid
        editMode="row"
        isCellEditable={(params) => params.row.tournament.id === tournament.id}
        autoheight
        rows={rows}
        columns={cols}
        {...props}
        processRowUpdate={async (newRow, orig) => {
          const res = await updateParticipation.mutateAsync(newRow);
          return res;
        }}
        onProcessRowUpdateError={(err) => console.log(err)}
      ></DataGrid>
    </div>
  );
};

export default TeamsTable;
