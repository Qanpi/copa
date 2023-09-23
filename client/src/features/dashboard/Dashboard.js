import NewTournamentPage from "./NewTournament.js";
import RegistrationStage from "./Registration.js";

function DashboardPage() {
  const state = "registration";

  switch(state) {
    case "kickstart":
      return <NewTournamentPage></NewTournamentPage>
    case "registration":
      return <RegistrationStage></RegistrationStage>
  }
}

export default DashboardPage;
