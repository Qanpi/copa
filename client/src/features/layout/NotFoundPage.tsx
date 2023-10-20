import { Stack, Typography, alpha, useTheme } from "@mui/material";
import { PromptContainer } from "./PromptContainer";

function NotFoundPage() {
    const theme = useTheme();

    return (
        <PromptContainer maxWidth="sm">
            <Stack spacing={5} sx={{padding: 3}} justifyContent={"center"}>
                <Typography variant="h2" color={alpha(theme.palette.primary.main, 0.5)}> 404 NOT FOUND</Typography>
                <Typography variant="body1">Sorry, we went looking for this page but couldn't find who asked.</Typography>
            </Stack>
        </PromptContainer>
    )
}

export default NotFoundPage;