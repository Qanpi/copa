import React, { createContext, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Home from "./pages/Home/Home.js";
import reportWebVitals from "./services/reportWebVitals";
import Header from "./components/Header/header";
import AdminPanelPage from "./pages/Admin/Panel/AdminPanel";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TeamsTable, MatchesTable } from "./pages/Tables/Tables";
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

export const AuthContext = createContext(null);
export const TournamentContext = createContext(null);

function App() {
  const queryClient = useQueryClient();

  const { isLoading: isUserLoading, data: userData } = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const res = await axios.get("/me");
      console.log(res.data);
      return res.data;
    },
  });

  const { data: tournamentData, isLoading: isTournamentLoading } = useQuery({
    queryKey: ["tournament", "current"],
    queryFn: async () => {
      const response = await axios.get("/api/tournaments/current");
      return response.data;
    },
  });

  return isUserLoading || isTournamentLoading ? (
    <div>Loading...</div>
  ) : (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthContext.Provider value={userData}>
            <TournamentContext.Provider value={tournamentData}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Header></Header>
                <div className="primary">
                  <Routes>
                    <Route path="/" element={<Home></Home>}></Route>
                    <Route path="/tables">
                      <Route
                        path="/tables/matches"
                        element={<MatchesTable></MatchesTable>}
                      ></Route>
                      <Route
                        path="/tables/teams"
                        element={<TeamsTable></TeamsTable>}
                      ></Route>
                    </Route>
                    <Route
                      path="/admin"
                      element={<AdminPanelPage></AdminPanelPage>}
                    ></Route>
                    <Route path="/users">
                      <Route
                        path="/users/me"
                        element={<ProfilePage></ProfilePage>}
                      ></Route>
                    </Route>
                    <Route path="/teams">
                      <Route path="/teams" element={<TeamPage></TeamPage>}></Route>
                      <Route path="/teams/new" element={<CreateTeamPage></CreateTeamPage>}></Route>
                      <Route path="/teams/join" element={<TeamPage></TeamPage>}></Route>
                      {/* <Route path="/teams/mine" element={<TeamPage></TeamPage>}></Route> */}
                    </Route>
                  </Routes>
                </div>
              </LocalizationProvider>
            </TournamentContext.Provider>
          </AuthContext.Provider>
        </Router>
      </QueryClientProvider>
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
