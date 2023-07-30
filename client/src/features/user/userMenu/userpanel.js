import "./userpanel.css";
import axios from "axios";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { useUser, useTeam } from "../../..";

function UserPanel() {
  const { status: userStatus, data: user } = useUser("me");
  const { data: team } = useTeam(user.team?.name);
  const queryClient = useQueryClient();

  const logout = useMutation({
    mutationFn: () => {
      return axios.post("/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  return user ? (
    <div className="user-panel">
      <div className="profile">
        <img src={user.avatar} referrerPolicy="no-referrer" alt="user avatar" />
        <p>{user.name}</p>
      </div>
      <div className="dropdown">
        <Link to={`/users/${user.id}`}>Profile</Link>
        <Link to={team ? `/teams/${team.name}` : "/teams/join"}>My team</Link>
        <p>Settings</p>
        <p onClick={logout.mutate}>Log out</p>
      </div>
    </div>
  ) : (
    <span onClick={handleSignIn}>{"Sign in"}</span>
  );
}

function handleSignIn() {
  //axios.get("login/federated/google")
  window.open("http://localhost:3001/login/federated/google", "_self");
}

export default UserPanel;