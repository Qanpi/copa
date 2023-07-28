import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useTournament } from "../../..";
import MyStepper from "../../inputs/stepper/mystepper";
import KickstartStage from "../kickstart/Kickstart";
import "./Dashboard.css";
import GroupStages from "../groupStage/GroupStage";
import RegistrationStage from "../registration/Registration";
import { Button } from "@mui/material";

function AdminDashboard() {
  const { status: tournamentStatus, data: tournament } =
    useTournament("current");

  const queryClient = useQueryClient();

  const updateTournamentStage = useMutation({
    mutationFn: async (values) => {
      const res = await axios.patch(`/api/tournaments/${tournament?.id}`, {
        stage: tournament.stages[stageId + values.inc],
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tournament", "current"]);
    },
  });

  const previousStage = () => updateTournamentStage.mutate({ inc: 1 });
  const nextStage = () => updateTournamentStage.mutate({ inc: -1 });

  if (!tournament?.stage) {
    return <KickstartStage></KickstartStage>;
  }

  const stageId = tournament.stages.indexOf(tournament.stage);

  const renderCurrentStage = () => {
    switch (tournament.stage) {
      case "Registration":
        return (
          <RegistrationStage
            next={nextStage}
            previous={previousStage}
          ></RegistrationStage>
        );
      case "Group stage":
        return (
          <GroupStages 
          next={nextStage}
          previous={previousStage}></GroupStages>
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

export default AdminDashboard;
