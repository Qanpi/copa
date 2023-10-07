import "./userpanel.css";
import axios from "axios";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { useTeam } from "../../team/hooks.ts";
import { useUser } from "../hooks.ts";

function UserPanel() {
  const { status: userStatus, data: user } = useUser("me");
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
        {user.team ? (
          <Link to={`/teams/${user.team.name}`}>My team</Link>
        ) : (
          <Link to={`/teams/none`}>My team</Link>
        )}
        <p>Settings</p>
        <p onClick={logout.mutate}>Log out</p>
      </div>
    </div>
  ) : (
    <Link to={`/login`}>Sign in</Link>
  );
}

export default UserPanel;
