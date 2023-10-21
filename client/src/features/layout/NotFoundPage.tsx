import { Stack, Typography, alpha, useTheme } from "@mui/material";
import { PromptContainer } from "./PromptContainer";
import OutlinedContainer from "./OutlinedContainer";

function NotFoundPage() {
    const theme = useTheme();

    return (
        <PromptContainer maxWidth="sm" sx={{ height: "100%" }}>
            <OutlinedContainer>
                <Stack spacing={10} sx={{ padding: 3 }} justifyContent={"center"} alignItems={"center"} display="flex">
                    <Typography variant="h2" color={alpha(theme.palette.primary.main, 0.5)}> 404 NOT FOUND</Typography>
                    <Typography variant="body1" textAlign={"left"}>Sorry, we went looking for this page but couldn't find who asked.</Typography>
                </Stack>
            </OutlinedContainer>
        </PromptContainer>
    )
}

export default NotFoundPage;