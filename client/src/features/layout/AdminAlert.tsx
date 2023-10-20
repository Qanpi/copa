import { ThemeProvider, Alert, AlertTitle, Typography, AlertProps } from "@mui/material";
import { lightTheme } from "../../themes";

function AdminAlert({ title, children, ...props }: AlertProps) {
    return (
        <ThemeProvider theme={lightTheme}>
            <Alert severity="error" sx={{ mb: 5 }} {...props}>
                <AlertTitle>
                    {title}
                </AlertTitle>
                {children}
            </Alert>
        </ThemeProvider>
    )
}

export default AdminAlert;