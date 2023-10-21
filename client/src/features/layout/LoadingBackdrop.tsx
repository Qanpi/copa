import {
  Backdrop,
  BackdropProps, CircularProgress
} from "@mui/material";


export const LoadingBackdrop = (props: BackdropProps) => {
  return <Backdrop sx={{ zIndex: 11 }} {...props}>
    <CircularProgress></CircularProgress>
  </Backdrop>;
};
