import {
  Alert, Snackbar,
  AlertProps,
  SnackbarProps
} from "@mui/material";
import { TFeedback } from "../types";


export const FeedbackSnackbar = ({ open, children, onClose, feedback, ...props }: SnackbarProps & { severity?: AlertProps["severity"], open?: boolean, success?: string, error?: string, feedback?: TFeedback}) => {
  const isOpen = feedback && !!feedback?.severity;

  if (!isOpen) return;

  return (
    <Snackbar open={isOpen} anchorOrigin={{ horizontal: "left", vertical: "bottom" }} onClose={onClose} autoHideDuration={3000} {...props}>
      <Alert severity={feedback.severity}>
        {feedback.message}
      </Alert>
    </Snackbar>
  );
};
