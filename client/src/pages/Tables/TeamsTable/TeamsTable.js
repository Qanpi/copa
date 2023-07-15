import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../../..";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { StepIcon } from "@mui/material";
import { CalendarIcon } from "@mui/x-date-pickers";

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
  const [status, data] = useTableQuery("teams"); // is this rly necesary?

  const userCols = [
    { field: "name", headerName: "Team name", width: 200 },
    { field: "division", headerName: "Division", editable: true, valueOptions: [], type: "singleSelect" },
  ];

  const adminCols = [
    { field: "id", headerName: "ID" },
    ...userCols,
    { field: "registered", headerName: "Registered" },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: () => {
        return [
          <GridActionsCellItem icon={<CalendarIcon></CalendarIcon>} label="Edit">

          </GridActionsCellItem>
        ]
      },
    },
  ];

  if (status === "loading") return <p>Loading...</p>;

  return <Table rows={data} userCols={userCols} adminCols={adminCols}></Table>;
}

const Table = ({ rows, userCols, adminCols }) => {
  const user = useContext(AuthContext);

  const cols = !user.isAdmin ? adminCols : userCols;
  const props = !user.isAdmin
    ? {
        checkboxSelection: true,
      }
    : {};

  return (
    <div style={{ width: "80%" }}>
      <DataGrid autoheight rows={rows} columns={cols} {...props}></DataGrid>
    </div>
  );
};

export default TeamsTable;
