import {
  Alert, Snackbar,
  AlertProps,
  SnackbarProps
} from "@mui/material";


export const FeedbackSnackbar = ({ open, children, onClose, severity, success, error, ...props }: SnackbarProps & { severity: AlertProps["severity"], open?: boolean, success?: string, error?: string}) => {
  return (
    <Snackbar open={!!severity} anchorOrigin={{ horizontal: "right", vertical: "bottom" }} onClose={onClose} autoHideDuration={3000} {...props}>
      <Alert severity={severity}>
        {severity === "success" ? success || "Operation completed succesfully" : error || "Oops. Something went wrong..."}
      </Alert>
    </Snackbar>
  );
};
