import { Box, Stack, Typography } from "@mui/material";
import { PromptContainer } from "../layout/PromptContainer";

function AboutPage() {
    return (
        <PromptContainer sx={{ alignItems: "center", justifyContent: "left" }}>
            <Typography variant="h4" sx={{mb: 2}}>ABOUT</Typography>
            <Stack direction="column" spacing={4}>
                <Box>
                    <Typography variant="h4">What is copa?</Typography>
                    <Typography>Copa is Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad sit saepe numquam enim nostrum dolor reprehenderit dignissimos quos ab nulla unde, eum et excepturi aut culpa quisquam itaque consectetur odit.</Typography>
                </Box>
                <Box>
                    <Typography variant="h4">What is the purpose of this website?</Typography>
                    <Typography>Copa is Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad sit saepe numquam enim nostrum dolor reprehenderit dignissimos quos ab nulla unde, eum et excepturi aut culpa quisquam itaque consectetur odit.</Typography>
                </Box>
                <Box>
                    <Typography variant="h4">How was this webapp made?</Typography>
                    <Typography>Copa is Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad sit saepe numquam enim nostrum dolor reprehenderit dignissimos quos ab nulla unde, eum et excepturi aut culpa quisquam itaque consectetur odit.</Typography>
                </Box>
                <Box>
                    <Typography variant="h4">How is private data handled?</Typography>
                    <Typography>Copa is Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad sit saepe numquam enim nostrum dolor reprehenderit dignissimos quos ab nulla unde, eum et excepturi aut culpa quisquam itaque consectetur odit.</Typography>
                </Box>
                <Box>
                    <Typography variant="h4">I want to contribute</Typography>
                    <Typography>Copa is Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad sit saepe numquam enim nostrum dolor reprehenderit dignissimos quos ab nulla unde, eum et excepturi aut culpa quisquam itaque consectetur odit.</Typography>
                </Box>
            </Stack>
        </PromptContainer>
    )
}

export default AboutPage;