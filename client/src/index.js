import React, { createContext, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Home from "./pages/Home/Home.js";
import reportWebVitals from "./services/reportWebVitals";
import Header from "./components/Header/header";
import AdminPanelPage from "./pages/Admin/Panel/AdminPanel";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import ProfilePage from "./pages/Profile/Profile";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import TeamPage from "./pages/Team/Team";
import CreateTeamPage from "./pages/CreateTeam/CreateTeam";
import JoinTeamPage from "./pages/JoinTeam/JoinTeam";
import RegistrationPage from "./pages/Registration/Registration";
import TeamsTable from "./pages/Tables/TeamsTable/TeamsTable";

export const useCurrentUser = () => {
  const { status, data } = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const res = await axios.get("/me");
      return res.data;
    },
  });

  return [status, data];
};

export const useCurrentTournament = () => {
  const { data, status } = useQuery({
    queryKey: ["tournaments", "current"],
    queryFn: async () => {
      const response = await axios.get("/api/tournaments/current");
      return response.data;
    },
  });

  return [status, data];
};

export const useTeam = (teamId, enabledFn) => {
  const { data, status } = useQuery({
    queryKey: ["teams", teamId],
    queryFn: async () => {
      const response = await axios.get(`/api/teams/${teamId}`);
      return response.data;
    },
    enabled: enabledFn ? enabledFn() : true,
  });

  return [status, data];
};

function App() {
  const queryClient = useQueryClient();

  const [tournamentStatus, tournamentData] = useCurrentTournament();
  const [userStatus, userData] = useCurrentUser();
  const [teamStatus, teamData] = useTeam(
    userData?.team,
    () => userData?.team !== undefined && userStatus === "success"
  );

  //TODO: refactor below to skeleton objects
  if (
    tournamentStatus !== "success" ||
    userStatus !== "success" ||
    teamStatus !== "success"
  )
    return <div>Loading..</div>;

  return (
    <React.StrictMode>
        <Router>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Header></Header>
                  <div className="primary">
                    <Routes>
                      <Route path="/" element={<Home></Home>}></Route>
                      <Route
                        path="/register"
                        element={<RegistrationPage></RegistrationPage>}
                      ></Route>
                      <Route path="/tables">
                        {/* <Route
                          path="/tables/matches"
                          element={<MatchesTable></MatchesTable>}
                        ></Route> */}
                        <Route
                          path="/tables/teams"
                          element={<TeamsTable></TeamsTable>}
                        ></Route>
                      </Route>
                      <Route path="/admin">
                        <Route
                          path="/admin/dashboard"
                          element={<AdminPanelPage></AdminPanelPage>}
                        ></Route>
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
    </React.StrictMode>
  );
}

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <QueryClientProvider client={queryClient}>
    <App></App>
  </QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
