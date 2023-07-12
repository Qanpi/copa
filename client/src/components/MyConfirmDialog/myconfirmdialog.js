import { Button, DialogActions, DialogContent, DialogContentText, Dialog, DialogTitle } from "@mui/material";

function MyConfirmDialog({title, alert, open, handleBoolConfirm}) {
   return(
    <Dialog open={open}>
        <DialogTitle>
            {title}
            {/* {"Proceed to group stages prematurely?"} */}
        </DialogTitle>
        <DialogContent>
            <DialogContentText>
                {/* Moving to the group stages before registration is over will abruptly end the registration process.  */}
                {alert}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button autoFocus onClick={() => handleBoolConfirm(false)}>No</Button>
            <Button onClick={() => handleBoolConfirm(true)}>Yes</Button>
        </DialogActions>
    </Dialog>
   ) 
}

export default MyConfirmDialog;