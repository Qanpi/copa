import { Box, Stack, Typography } from "@mui/material";
import { PromptContainer } from "../layout/PromptContainer";
import { ReactNode } from "react";

export const QAndA = ({ q, a, children }: { q: string, a?: string, children?: ReactNode }) => {
    return <Box>
        <Typography variant="h5" color="primary" sx={{mb: 1}}>{q}</Typography>
        {children ? children : <Typography>{a}</Typography>}
    </Box>
}

function AboutPage() {
    return (
        <PromptContainer sx={{ alignItems: "center", justifyContent: "left" }}>
            <Stack direction="column" spacing={4}>
                <Typography variant="h4">ABOUT</Typography>
                <QAndA q={"What is copa?"} a="Copa is Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad sit saepe numquam enim nostrum dolor reprehenderit dignissimos quos ab nulla unde, eum et excepturi aut culpa quisquam itaque consectetur odit."></QAndA>
                <QAndA q={"What is the purpose of this website?"} a="Not to encroach upon what copa is, but rather to augment it by adding various cool functionality."></QAndA>
                <QAndA q={"What is the purpose of this website?"} a="Not to encroach upon what copa is, but rather to augment it by adding various cool functionality."></QAndA>
                <Box>
                    <Typography variant="h5">How was this webapp made?</Typography>
                    <Typography>Copa is Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad sit saepe numquam enim nostrum dolor reprehenderit dignissimos quos ab nulla unde, eum et excepturi aut culpa quisquam itaque consectetur odit.</Typography>
                </Box>
                <Box>
                    <Typography variant="h5">How is private data handled?</Typography>
                    <Typography>Copa is Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad sit saepe numquam enim nostrum dolor reprehenderit dignissimos quos ab nulla unde, eum et excepturi aut culpa quisquam itaque consectetur odit.</Typography>
                </Box>
                <Box>
                    <Typography variant="h5">I want to contribute</Typography>
                    <Typography>Copa is Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad sit saepe numquam enim nostrum dolor reprehenderit dignissimos quos ab nulla unde, eum et excepturi aut culpa quisquam itaque consectetur odit.</Typography>
                </Box>
                <Box>
                    <Typography variant="h5">Special thanks to</Typography>
                    <Typography>The wonderful L21i class :).</Typography>
                </Box>
            </Stack>
        </PromptContainer>
    )
}

export default AboutPage;