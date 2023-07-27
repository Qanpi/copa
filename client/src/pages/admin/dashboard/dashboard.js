import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useTournament } from "../../..";
import MyStepper from "../../../components/inputs/MyStepper/mystepper";
import KickstartPage from "../Kickstart/Kickstart";
import "./dashboard.css";
import GroupStagePage from "../GroupStage/GroupStage";
import AdminRegistrationPage from "../Registration/Registration";
import { Button } from "@mui/material";

function AdminPanelPage() {
  const {status: tournamentStatus, data: tournament} = useTournament("current");

  const queryClient = useQueryClient();

  const moveToNextStage = useMutation({
    mutationFn: async () => {
      const res = await axios.patch(`/api/tournaments/${tournament?.id}`, {
        stage: tournament.stages[stageId + 1],
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tournament", "current"]);
    },
  });

  if (!tournament?.stage) {
    return <KickstartPage></KickstartPage>;
  }

  const stageId = tournament.stages.indexOf(tournament.stage);

  const renderCurrentStage = () => {
    switch (tournament.stage) {
      case "Registration":
        return (
          <AdminRegistrationPage
            moveToNextStage={moveToNextStage}
          ></AdminRegistrationPage>
        );
      case "Group stage":
        return (
          <GroupStagePage moveToNextStage={moveToNextStage}></GroupStagePage>
        );
    }
  };

  return (
    <>
      <div className="title">
        <h1>Copa I</h1>
        <h3>Autumn 2023</h3>
      </div>
      <div>
        <MyStepper steps={tournament.stages} activeStep={stageId}></MyStepper>
        {renderCurrentStage()}
        {/* <MyChecklist items={tasks} heading="Checklist"></MyChecklist> */}
      </div>
    </>
  );
}

export default AdminPanelPage;
