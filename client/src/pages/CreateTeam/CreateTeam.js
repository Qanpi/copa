import { useContext } from "react";
import TeamInfoForm from "../../components/TeamInfoForm/teaminfoform";
import { AuthContext } from "../..";
import { Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import MyConfirmDialog from "../../components/MyConfirmDialog/myconfirmdialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios"

function CreateTeamPage() {
  const user = useContext(AuthContext);

  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const leaveTeam = useMutation({
    mutationFn: (team, user) => {
      axios.delete(`/api/teams/${team.id}`, {})
      axios.patch()
    },
    onSuccess: () => {d 

    }
  })

  const handleDialogResponse = (userChoice) => {
    if (userChoice) {
    } else {
      return navigate(`/teams/${user.team.id}`);
      //return
    }
  };

  return (
    <>
      <MyConfirmDialog
        title="Leave current team to create a new one?"
        alert="You must leave your current team in order to make one of your own."
        open={user.team}
        handleBoolConfirm={handleDialogResponse}
      ></MyConfirmDialog>
      <h1>Create new team</h1>
      <TeamInfoForm></TeamInfoForm>
    </>
  );
}

export default CreateTeamPage;
