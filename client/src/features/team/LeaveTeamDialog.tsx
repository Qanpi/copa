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
import { useUpdateUser, useUser } from "../user/hooks";

function LeaveTeamDialog({ onLeave, onStay}) {
    const {data: user} = useUser("me");
    const updateUser = useUpdateUser();

    const handleDialog = async (choice: boolean) => {
        if (choice) {
            await updateUser.mutateAsync({ id: user.id, team: null });
            if (onLeave) onLeave();
        } else {
            if (onStay) onStay();
        }
    };

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