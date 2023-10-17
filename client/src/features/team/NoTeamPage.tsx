import { useNavigate } from "react-router";
import { useUser } from "../user/hooks"
import { useTeam } from "./hooks";
import { Stack, Box, Button, Container, Typography, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { PromptContainer } from "../participant/registration";

function NoTeamPage() {
    const { data: user } = useUser("me");
    const { data: team, status: teamStatus } = useTeam(user.team?.name);

    const navigate = useNavigate();
    useEffect(() => {
        if (team) navigate(`/teams/${team.name}`);
    }, [team])

    return <PromptContainer>
        <Box>
            <Typography>You are not currently part of a team.</Typography>
            <Stack direction="row" spacing={1} display="flex" alignItems="center" justifyContent={"center"} sx={{ mt: 2 }}>
                <Link to="/teams/create">
                    <Button variant="contained" fullWidth>Create</Button>
                </Link>
                <Tooltip title="To join a team, ask the manager to send you an invite link.">
                    <Button variant="contained" color="secondary" fullWidth>Join</Button>
                </Tooltip>
            </Stack>
        </Box>
    </PromptContainer>
}

export default NoTeamPage;