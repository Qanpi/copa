import { Tooltip } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { CalendarIcon } from "@mui/x-date-pickers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { useTournament } from "../../../..";

const participationKeys = {
  all: ["participations"],
  lists: () => [participationKeys.all, "list"],
  list: (filter) => [participationKeys.lists(), filter]
}

const useParticipations = () => {
  return useQuery({
    queryKey: [participationKeys.all],
    queryFn: async () => {
      const res = await axios.get(`/api/${participationKeys.all}`);
      return res.data; 
    },
  });
}

function TeamsTable() {
  const queryClient = useQueryClient();

  const {data: participations, status: participationsStatus} = useParticipations();
  const {data: tournament} = useTournament("current");

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
              onClick={() => unregisterTeam.mutate(params)}
              icon={<CalendarIcon></CalendarIcon>}
              label="Revoke registration"
            ></GridActionsCellItem>
          </Tooltip>,
        ];
      },
    },
  ];

  if (participationsStatus !== "success") return <p>Loading...</p>
  return <Table rows={participations} cols={cols}></Table>;
}

const Table = ({ rows, cols }) => {
  const {status: tournamentStatus, data: tournament} = useTournament("current");

  const updateParticipation = useMutation({
    mutationFn: async (values) => {
      const res = await axios.put(`/api/participations/${values.id}`, values);
      return res.data;
    },
  });

  if (tournamentStatus !== "success") return <p>Loading...</p>

  return (
    <div style={{ width: "80%" }}>
      <DataGrid
        editMode="row"
        isCellEditable={(params) => params.row.tournament.id === tournament?.id}
        autoheight
        rows={rows}
        columns={cols}
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
