import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import { useTeam, useTeamById } from "./hooks.ts";
import { useUpdateUser, useAuth, userKeys } from "../user/hooks.ts";
import LeaveTeamDialog from "./LeaveTeamDialog.tsx";
import { TUser } from "@backend/models/user.ts";
import { TTeam } from "@backend/models/team.ts";
import { LoadingBackdrop } from "../layout/LoadingBackdrop.tsx";
import { PromptContainer } from "../layout/PromptContainer.tsx";

function JoinTeamPage() {
  const { data: user } = useAuth();

  if (!user) return <LoadingBackdrop open={true}></LoadingBackdrop>

  if (user.team) return (
    <PromptContainer>You are already in a team.</PromptContainer>
  )
  return (
    <PromptContainer>Something went wrong </PromptContainer>
  )
}

export default JoinTeamPage;
