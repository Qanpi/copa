import { useTournament } from "../../..";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery, useMutation } from "@tanstack/react-query";

export const participationKeys = {
  all: "participations",
  query: (query) => [participationKeys.all, "query", query],
};

// query: {sort: "group"}
export const useParticipations = (query) => {
  return useQuery({
    queryKey: [participationKeys.query(query)],

    queryFn: async () => {
      let queryString = `/api/${participationKeys.all}`;

      if (query) {
        queryString += "?";
        Object.entries(query).forEach(([k, v]) => (queryString += `${k}=${v}`));
      }

      const res = await axios.get(queryString);
      return res.data;
    },
  });
};

const MyTable = ({ rows, cols }) => {
  const { status: tournamentStatus, data: tournament } =
    useTournament("current");

  const updateParticipation = useMutation({
    mutationFn: async (values) => {
      const res = await axios.put(`/api/participations/${values.id}`, values);
      return res.data;
    },
  });

  if (tournamentStatus !== "success") return <p>Loading...</p>;

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

export default MyTable;
