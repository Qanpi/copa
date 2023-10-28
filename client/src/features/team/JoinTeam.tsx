import { TTeam } from "@backend/models/team.ts";
import { TUser } from "@backend/models/user.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { LoadingBackdrop } from "../layout/LoadingBackdrop.tsx";
import { useAuth, userKeys } from "../user/hooks.ts";
import LeaveTeamDialog from "./LeaveTeamDialog.tsx";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useTeam } from "./hooks.ts";
import NotFoundPage from "../layout/NotFoundPage.tsx";
import { PromptContainer } from "../layout/PromptContainer.tsx";
import { GoogleSignInButton } from "../user/userpanel.tsx";
import { TeamBannerInput } from "./CreateTeam.tsx";
import dayjs from "dayjs";

function JoinTeamPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const name = searchParams.get("name");
  const token = searchParams.get("token");

  const { data: user, isLoading: isAuthLoading } = useAuth();
  const { data: team, isLoading: isTeamLoading } = useTeam(name || undefined);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const joinTeam = useMutation({
    mutationFn: async (values: TTeam["invite"] & { id: string }) => {
      const res = await axios.post(`/api/teams/${values.id}/join`, {
        token: values.token
      });

      return res.data as TUser;
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries(userKeys.id("me"));
      queryClient.invalidateQueries(userKeys.list({teamId: user.team!.id}));
      navigate(`/teams/${encodeURIComponent(user.team!.name!)}`);
    },
    meta: {
      errorMessage: "This link is invalid/expired."
    }
  });


  if (!name || !token) return <NotFoundPage></NotFoundPage>;

  const handleJoinTeam = () => {
    if (!name || !token || !user || !team) return;

    if (!user?.team) joinTeam.mutate({ id: team.id, token });
  }

  if (isAuthLoading || isTeamLoading) return <LoadingBackdrop open={true}></LoadingBackdrop>;

  if (!user) return <PromptContainer>
    <Stack direction="column" spacing={2} alignItems="center">
      <Typography>Please sign in to proceed.</Typography>
      <GoogleSignInButton variant="contained" color="primary"></GoogleSignInButton>
    </Stack>
  </PromptContainer>

  if (!team) return <NotFoundPage></NotFoundPage>;

  return <PromptContainer sx={{pt: 5}}>
    {user.team !== undefined ? (
      <LeaveTeamDialog
        onLeave={handleJoinTeam}
        onStay={() => navigate(`/teams/${encodeURIComponent(user.team!.name!)}`)}
      ></LeaveTeamDialog>) : null}
    <Stack direction="column" alignItems="center" spacing={5}>
      <Box sx={{ width: "min(500px, 50vw)", aspectRatio: 1, position: "relative" }}>
        <Box sx={{ objectFit: "contain", width: "100%", height: "100%" }} component="img" src={team.bannerUrl}></Box>
        <Box sx={{position: "absolute", bottom: -3}}>
          <Typography variant="h2">{team.name}</Typography>
          <Typography>Est. {dayjs(team.createdAt).format("YYYY")}</Typography>
        </Box>
      </Box>
      <Button onClick={handleJoinTeam} fullWidth variant="contained" color="secondary">Join</Button>
    </Stack>
  </PromptContainer>

}

export default JoinTeamPage;
