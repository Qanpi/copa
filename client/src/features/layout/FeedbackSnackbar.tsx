import {
  Alert, Snackbar,
  AlertProps,
  SnackbarProps
} from "@mui/material";


export const FeedbackSnackbar = ({ open, children, onClose, severity, message, ...props }: SnackbarProps & { severity: AlertProps["severity"], open?: boolean, success?: string, error?: string}) => {
  return (
    <Snackbar open={!!severity} anchorOrigin={{ horizontal: "right", vertical: "bottom" }} onClose={onClose} autoHideDuration={3000} {...props}>
      <Alert severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  );
};
