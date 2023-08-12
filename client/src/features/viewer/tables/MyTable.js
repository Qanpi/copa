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


 
};

export default MyTable;
