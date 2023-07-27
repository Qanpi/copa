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

const userKeys = {
  all: ["users"],
  details: () => [...userKeys.all, "detail"],
  detail: (id) => [...userKeys.details(), id],
};

export const useUser = (id) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const res =
        id === "me"
          ? await axios.get("/me")
          : await axios.get(`/api/${userKeys.all}/${id}`);
      return res.data;
    },
  });
};

// export const useAuth = () => {
//   return useQuery({
//     queryKey: userKeys.detail("me"),
//     queryFn: async () => {
//       const res = await axios.get(`/me`);
//       return res.data;
//     }
//   })
// }

export const tournamentKeys = {
  all: ["tournaments"],
  details: () => [...tournamentKeys.all, "detail"],
  detail: (id) => [...tournamentKeys.details(), id],
};

export const useTournament = (id) => {
  return useQuery({
    queryKey: tournamentKeys.detail(id),
    queryFn: async () => {
      const response = await axios.get(`/api/${tournamentKeys.all}/${id}`);
      return response.data;
    },
  });
};

export const teamKeys = {
  all: ["teams"],
  details: () => [teamKeys.all, "detail"],
  detail: () => [teamKeys.details(), "default"],
};

export const useTeam = (name) => {
  return useQuery({
    queryKey: teamKeys.detail(name),
    queryFn: async () => {
      const response = await axios.get(`/api/teams/?name=${name}`);
      return response.data[0] || null; //assuming the response is array
    },
    enabled: !!name,
  });
};

// export const useAuth = () => {
//   return useQuery({
//     queryKey: ["me"],
//     queryFn: async () => {
//       const res = await axios.get("/me");
//       return res.data;
//     }
//   })
// }

function App() {
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
