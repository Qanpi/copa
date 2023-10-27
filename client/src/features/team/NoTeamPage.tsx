import { useNavigate } from "react-router";
import { useAuth } from "../user/hooks"
import { useTeam } from "./hooks";
import { Stack, Box, Button, Container, Typography, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { PromptContainer } from "../layout/PromptContainer";

function NoTeamPage() {
    const { data: user } = useAuth();
    const { data: team, status: teamStatus } = useTeam(user?.team?.name);

    const navigate = useNavigate();
    useEffect(() => {
        if (team) navigate(`/teams/${encodeURIComponent(team.name)}`);
    }, [team])

    return <PromptContainer>
        <Box>
            <Typography>You are not currently part of a team.</Typography>
            <Stack direction="row" spacing={1} display="flex" alignItems="center" justifyContent={"center"} sx={{ mt: 2 }}>
                <Link to="/team/create">
                    <Button variant="contained" fullWidth>Create</Button>
                </Link>
                <Tooltip title="To join a team, ask the manager to send you an invite link." enterTouchDelay={0}>
                    <Button variant="contained" color="secondary" fullWidth>Join</Button>
                </Tooltip>
            </Stack>
        </Box>
    </PromptContainer>
}

export default NoTeamPage;