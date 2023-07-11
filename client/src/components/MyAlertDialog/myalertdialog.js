import { Button, DialogActions, DialogContent, DialogContentText, Dialog, DialogTitle } from "@mui/material";

function MyAlertDialog({open, handleBoolConfirm}) {
   return(
    <Dialog open={open}>
        <DialogTitle>
            {"Proceed to group stages prematurely?"}
        </DialogTitle>
        <DialogContent>
            <DialogContentText>
                Moving to the group stages before registration is over will abruptly close the registration process. 
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button autofocus onClick={() => handleBoolConfirm(false)}>No</Button>
            <Button onClick={() => handleBoolConfirm(true)}>Yes</Button>
        </DialogActions>
    </Dialog>
   ) 
}

export default MyAlertDialog;