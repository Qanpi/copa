import { useNavigate } from "react-router";
import { useUser } from "../user/hooks"
import { useTeam } from "./hooks";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useEffect } from "react";

function NoTeamPage() {
    const {data: user} = useUser("me");
    const {data: team, status: teamStatus} = useTeam(user.team?.name);

    // const navigate = useNavigate();

    // useEffect(() => {
    //     if (team) navigate(`/teams/${team.name}`);
    // }, [team])

    return <>
        To join a team, please ask the manager for the link.
        <Link to="/teams/new">Create team</Link>
    </>
}

export default NoTeamPage;