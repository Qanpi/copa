import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { tournamentKeys, useTournament } from "../../../..";
import MyStepper from "../../../inputs/stepper/mystepper";
import SettingsStage from "../settings/Settings";
import "./Dashboard.css";
import GroupStages from "../groupStage/GroupStage";
import RegistrationStage from "../registration/Registration";
import { Button } from "@mui/material";
import CreateTournament from "../../../tournament/admin/create/CreateTournament";

export const useUpdateTournament = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values) => {
      const res = await axios.patch(`/api/tournaments/${id}`, values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(tournamentKeys.detail(id));
    },
  });
};

function DashboardPage() {
  const { status: tournamentStatus, data: tournament } =
    useTournament("current");
  const updateTournament = useUpdateTournament(tournament?.id);

  if (!tournament) return <CreateTournament></CreateTournament>;

  const stageId = tournament.stages.indexOf(tournament.statuses);

  const handleClickBack = () =>
    updateTournament.mutate({ stage: tournament.stages[stageId - 1] });
  const handleClickNext = () =>
    updateTournament.mutate({ stage: tournament.stages[stageId + 1] });

  const renderCurrentStage = () => {
    switch (stageId) {
      case 0:
        return <SettingsStage></SettingsStage>;
      case 1:
        return <RegistrationStage></RegistrationStage>;
      case 2:
        return (
          <GroupStages></GroupStages>
        );
      default: 
          return <div>No corresponding stage.</div>
    }
  };

  return (
    <>
      <div className="title">
        <h1>Copa I</h1>
        <h3>Autumn 2023</h3>
      </div>
      <div>
        <MyStepper steps={tournament.statuses} activeStep={stageId}></MyStepper>
        {renderCurrentStage()}
        <Button onClick={handleClickBack}>Back</Button>
        <Button onClick={handleClickNext}>Next</Button>
        {/* <MyChecklist items={tasks} heading="Checklist"></MyChecklist> */}
      </div>
    </>
  );
}

export default DashboardPage;
