import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Header from "./features/viewer/header/header";
import "./index.css";
import DashboardPage from "./features/tournament/admin/dashboard/Dashboard";
import CreateTeamPage from "./features/team/create/CreateTeam";
import HomePage from "./features/viewer/home/Home";
import ProfilePage from "./features/user/profile/Profile";
import RegistrationPage from "./features/team/registration/registration";
import TeamsPage from "./features/team/table/ParticipantsTable";
import TeamPage from "./features/team/profile/Team";
import JoinTeamPage from "./features/team/join/JoinTeam";
import reportWebVitals from "./services/reportWebVitals";
import DrawPage from "./features/team/admin/Draw.js";
import StructurePage from "./features/tournament/admin/structure/structure";
import TournamentStructureDemo from "./features/tournament/admin/structure/structureDemo";
import MatchesPage from "./features/tournament/matches/Matches";
import MatchPage from "./features/tournament/matches/page/MatchPage";

function App() {
  return (
    <Router>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Header></Header>
        <div className="primary">
          <Routes>
            <Route path="/" element={<HomePage></HomePage>}></Route>

            <Route path="/tournament">
              <Route
                path="/tournament/register"
                element={<RegistrationPage></RegistrationPage>}
              ></Route>

              <Route
                path="/tournament/dashboard"
                element={<DashboardPage></DashboardPage>}
              ></Route>

              <Route
                path="/tournament/structure"
                element={<StructurePage></StructurePage>}
              ></Route>

              <Route path="/tournament/draw" element={<DrawPage></DrawPage>}></Route>

              <Route
                path="/tournament/teams"
                element={<TeamsPage></TeamsPage>}
              ></Route>

              <Route path="/tournament/matches">
                <Route
                  path="/tournament/matches/:id"
                  element={<MatchPage></MatchPage>}
                ></Route>

                <Route
                  path="/tournament/matches"
                  element={<MatchesPage></MatchesPage>}
                ></Route>
              </Route>
            </Route>

            <Route path="/users">
              <Route
                path="/users/:id"
                element={<ProfilePage></ProfilePage>}
              ></Route>
            </Route>

            <Route path="/teams">
              <Route
                path="/teams/join"
                element={<JoinTeamPage></JoinTeamPage>}
              ></Route>

              <Route
                path="/teams/new"
                element={<CreateTeamPage></CreateTeamPage>}
              ></Route>

              <Route
                path="/teams/:name"
                element={<TeamPage></TeamPage>}
              ></Route>
            </Route>
          </Routes>
        </div>
      </LocalizationProvider>
    </Router>
  );
}

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <App></App>
    </React.StrictMode>
  </QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
