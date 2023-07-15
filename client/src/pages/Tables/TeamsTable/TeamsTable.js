import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useContext } from "react";
import { AuthContext, TeamContext, TournamentContext } from "../../..";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { StepIcon } from "@mui/material";
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
  const tournament = useContext(TournamentContext);

  const { status, data: participations } = useQuery({
    queryKey: ["participations"],
    queryFn: async () => {
      const res = await axios.get(`/api/participations`);
      return res.data; //assumed it's a singular value
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
      renderCell: params => (
        <Link to={`/teams/${params.row.team.name}`}> 
          {params.value}
        </Link>
      )
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
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: () => {
        return [
          <GridActionsCellItem
            icon={<CalendarIcon></CalendarIcon>}
            label="Edit"
          ></GridActionsCellItem>,
        ];
      },
    },
  ];

  if (status === "loading") return <p>Loading...</p>;

  return <Table rows={participations} adminCols={adminCols}></Table>;
}

const Table = ({ rows, userCols, adminCols }) => {
  const user = useContext(AuthContext);
  const tournament = useContext(TournamentContext);

  const cols = !user.isAdmin ? adminCols : userCols;
  const props = !user.isAdmin
    ? {
        checkboxSelection: true,
      }
    : {};

    //FIXME: repeated code
  const updateParticipation = useMutation({
    mutationFn: async (values) => {
      const res = await axios.patch(`/api/teams/${values.id}`, values);
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
        processRowUpdate={(newRow, orig) => {
          console.log(newRow, orig)
        }}
      ></DataGrid>
    </div>
  );
};

export default TeamsTable;
