import {
  Alert, Snackbar,
  AlertProps,
  SnackbarProps
} from "@mui/material";
import { TFeedback } from "../types";


export const FeedbackSnackbar = ({ open, children, onClose, severity, message, feedback, ...props }: SnackbarProps & { severity?: AlertProps["severity"], open?: boolean, success?: string, error?: string, feedback?: TFeedback}) => {
  //backwards compatibility
  const isOpen = severity ? !!severity : !!feedback?.severity;

  return (
    <Snackbar open={isOpen} anchorOrigin={{ horizontal: "left", vertical: "bottom" }} onClose={onClose} autoHideDuration={3000} {...props}>
      <Alert severity={severity || feedback?.severity}>
        {message || feedback?.message}
      </Alert>
    </Snackbar>
  );
};
