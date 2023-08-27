import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { tournamentKeys, useTournament } from "../../../..";
import MyStepper from "../../../inputs/stepper/mystepper";
import SettingsStage from "../settings/Settings";
import "./Dashboard.css";
import GroupStages from "../groupStage/GroupStage";
import RegistrationStage from "../registration/Registration";
import { Button } from "@mui/material";
import NewTournamentPage from "../../../tournament/admin/create/CreateTournament";
import StructurePage from "../structure/structure";

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

export const useMutateNextStage = () => {
  const { data: tournament } = useTournament("current");
  const updateTournament = useUpdateTournament();

  return () => {
    updateTournament.mutate({
      stage: tournament.statuses[tournament.stageId + 1],
    });
  };
};

export const useMutatePreviousStage = () => {
  const { data: tournament } = useTournament("current");
  const updateTournament = useUpdateTournament();

  return () => {
    updateTournament.mutate({
      stage: tournament.statuses[tournament.stageId - 1],
    });
  };
};

function DashboardPage() {
  const { status: tournamentStatus, data: tournament } =
    useTournament("current");

  if (!tournament) return <NewTournamentPage></NewTournamentPage>;

  const renderCurrentStage = () => {
    switch (tournament.stage) {
      case "Registration":
        // return <SettingsStage></SettingsStage>;
        return <RegistrationStage></RegistrationStage>;
      case "Group stage":
        return <StructurePage></StructurePage>;
      case "Bracket":
      case "Over":
      default:
        return <div>No corresponding stage.</div>;
    }
  };

  return (
    <>
      <div className="title">
        <h1>Copa I</h1>
        <h3>Autumn 2023</h3>
      </div>
      <div>
        <MyStepper
          steps={tournament.statuses}
          activeStep={tournament.stageId}
        ></MyStepper>
        {renderCurrentStage()}
        {/* <MyChecklist items={tasks} heading="Checklist"></MyChecklist> */}
      </div>
    </>
  );
}

export default DashboardPage;
