import { useTournament } from "../../..";
import axios from "axios"
import { DataGrid } from "@mui/x-data-grid";
import { useQuery, useMutation } from "@tanstack/react-query";

export const participationKeys = {
  all: ["participations"],
  lists: () => [participationKeys.all, "list"],
  list: (filter) => [participationKeys.lists(), filter]
}

export const useParticipations = () => {
  return useQuery({
    queryKey: [participationKeys.all],
    queryFn: async () => {
      const res = await axios.get(`/api/${participationKeys.all}`);
      return res.data; 
    },
  });
}

const MyTable = ({ rows, cols }) => {
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

export default MyTable;