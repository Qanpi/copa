import { Box, Typography, Container } from "@mui/material";
import { ReactNode } from "react";
import MatchesCalendar from "../match/MatchesCalendar";
import GradientTitle from "./gradientTitle";

function BannerPage({title, children }: {title: string, children: ReactNode }) {
    return (
        <Box sx={{ pt: 5 }}>
            <GradientTitle>
                <Typography variant="h2">{title}</Typography>
            </GradientTitle>
            <Container>
                {children}
            </Container >
        </Box>
    )
}

export default BannerPage;