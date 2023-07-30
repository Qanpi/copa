import {
  Alert,
  AlertTitle,
  Button
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link, useSearchParams } from "react-router-dom";

function JoinTeamPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [errorDialog, setErrorDialog] = useState(false);

  const navigate = useNavigate();

  const joinTeam = useMutation({
    mutationFn: async (values) => {
      const res = await axios.post(`/api/teams/${values.id}/join`, {
        token: values.token,
      });

      return res.data;
    },
    onSuccess: team => navigate(`/teams/${team.name}`),
    onError: () => setErrorDialog(true),
  });

  useEffect(() => {
    const id = searchParams.get("id");
    const token = searchParams.get("token");

    if (id && token) joinTeam.mutate({id, token});
  }, [searchParams]);

  return (
    <>
    <Alert severity="error">
      <AlertTitle>Invalid or expired token.</AlertTitle>
      Please ask the team manager to resend invite link or contact support.
    </Alert>

      <div>
        To join a team, paste in the link.
        <Button>Join</Button>
      </div>
      <div>
        <Link to="/teams/new">
          <Button>Create</Button>
        </Link>
      </div>
    </>
  );
}

export default JoinTeamPage;