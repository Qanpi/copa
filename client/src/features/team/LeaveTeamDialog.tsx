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
import { useUpdateUser, useAuth } from "../user/hooks";
import { TUser } from "@backend/models/user";
import { useRemoveUserFromTeam } from "./hooks";
import { TTeam } from "@backend/models/team";

function LeaveTeamDialog({ onLeave, onStay }: { onLeave?: (user: TUser) => void, onStay?: (user: TUser) => void }) {
    const { data: user } = useAuth();
    const removeUserFromTeam = useRemoveUserFromTeam();

    const handleDialog = async (choice: boolean) => {
        if (choice && user?.team?.id) {
            await removeUserFromTeam.mutateAsync({ userId: user.id, teamId: user.team.id.toString() });
            if (onLeave) onLeave(user);
        } else {
            if (onStay) onStay(user);
        }
    };

    if (!user) return <>Loading</>

    return (
        <Dialog open={!!user.team}>
            <DialogTitle>You are currently in a team.</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Would you like to first leave your current team?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleDialog(true)}>Yes</Button>
                <Button onClick={() => handleDialog(false)}>No</Button>
            </DialogActions>
        </Dialog>
    )
}

export default LeaveTeamDialog;