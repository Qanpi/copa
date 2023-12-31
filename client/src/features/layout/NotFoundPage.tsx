import { Stack, Typography, alpha, useTheme } from "@mui/material";
import { PromptContainer } from "./PromptContainer";
import OutlinedContainer from "./OutlinedContainer";

function NotFoundPage() {
    const theme = useTheme();

    return (
        <PromptContainer>
            <Typography variant="h2" color={alpha(theme.palette.primary.main, 0.5)} > 404 NOT FOUND</Typography>
            <Typography variant="body1" textAlign={"left"} sx={{mt: 2}}>Sorry, we went looking for this page but couldn't find who asked.</Typography>
        </PromptContainer> 
    )
}

export default NotFoundPage;