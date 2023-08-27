import { Button, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { tournamentKeys } from "../../../..";

function NewTournamentPage() {
  const queryClient = useQueryClient();

  const createTournament = useMutation({
    mutationFn: async () => {
      const res = await axios.post("/api/tournaments")
      return res.data;
    },
    onSuccess: (tournament) => {
      queryClient.setQueryData("current", tournament)
    }
  })
  return (
    <>
      <Typography>You are not currently hosting a tournament.</Typography>
      <Button onClick={createTournament.mutate}>Create</Button>
    </>
  );
}

export default NewTournamentPage;
