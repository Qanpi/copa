import { ThemeProvider, Alert, AlertTitle, Typography, AlertProps, BoxProps, Box, StackProps, Stack } from "@mui/material";
import { lightTheme } from "../../themes";
import React, { Children } from "react";

function AdminAlertStack({ children, sx, ...props }: StackProps) {
    return (
        <ThemeProvider theme={lightTheme}>
            <Stack sx={{ mb: 5 , ...sx}} spacing={1} {...props}>
                {children}
            </Stack>
        </ThemeProvider >
    )
}

export default AdminAlertStack;