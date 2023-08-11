import { useTournament } from "../../..";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Typography } from "@mui/material";

export const participationKeys = {
  all: "participations",
  query: (query) => [participationKeys.all, "query", query],
};

// query: {sort: "group"}
export const useParticipations = (query, enabled) => {
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
    enabled: enabled === undefined ? true : enabled,
  });
};

const MyTable = ({ rows, cols, title, ...dataGridProps }) => {
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
    <div sx={{ width: "80%" }}>
      <Typography>{title}</Typography>
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
        {...dataGridProps}
      ></DataGrid>
    </div>
  );
};

export default MyTable;
