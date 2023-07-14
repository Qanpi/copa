import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../../..";
import { DataGrid } from "@mui/x-data-grid";

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
  const user = useContext(AuthContext);

  const [status, data] = useTableQuery("teams"); // is this rly necesary?

  const userCols = [
    { field: "name", headerName: "Team name",  width: 200 },
    { field: "division", headerName: "Division" },
  ];

  if (status === "loading") return <p>Loading...</p>;

  return !user.isAdmin ? (
    <AdminTable
      rows={data}
      cols={[{field: "id"}, ...userCols, ]}
    ></AdminTable>
  ) : (
    <UserTable rows={data} cols={userCols}></UserTable>
  );
}

export default TeamsTable;

const UserTable = ({ rows, cols }) => {
  return (
    <div style={{ width: "80%" }}>
      <DataGrid
        autoHeight
        rows={rows}
        columns={cols}
        checkboxSelection
      ></DataGrid>
    </div>
  );
};

const AdminTable = ({ rows, cols }) => {
  return (
    <div style={{ height: 300, width: "80%" }}>
      <DataGrid rows={rows} columns={cols} checkboxSelection></DataGrid>
    </div>
  );
};
