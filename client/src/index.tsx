import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import DashboardPage from "./features/dashboard/Dashboard.js";
import NewTeamPage from "./features/team/create/CreateTeam";
import DrawPage from "./features/dashboard/Draw.tsx";
import JoinTeamPage from "./features/team/join/JoinTeam";
import TeamPage from "./features/team/profile/Team";
import RegistrationPage from "./features/team/registration/registration";
import TeamsPage from "./features/team/table/ParticipantsTable";
import BracketPage from "./features/tournament/bracket/Bracket.tsx";
import GroupStagePage from "./features/tournament/groupStage/GroupStage.tsx";
import MatchesPage from "./features/tournament/matches/Matches.tsx";
import MatchPage from "./features/tournament/matches/page/MatchPage";
import ProfilePage from "./features/user/profile/Profile";
import Header from "./features/viewer/header/header";
import HomePage from "./features/viewer/home/Home";
import "./index.css";
import reportWebVitals from "./services/reportWebVitals";

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

              <Route path="/tournament/groups"
              element={<GroupStagePage></GroupStagePage>}></Route>

              <Route
                path="/tournament/bracket"
                element={<BracketPage></BracketPage>}
              >R</Route>

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
                element={<NewTeamPage></NewTeamPage>}
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
