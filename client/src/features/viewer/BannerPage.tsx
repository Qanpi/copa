import { Box, Typography, Container } from "@mui/material";
import { ReactNode } from "react";
import MatchesCalendar from "../match/MatchesCalendar";
import GradientTitle from "./gradientTitle";

function BannerPage({title, header, children }: {title?: string, header?: ReactNode, children: ReactNode }) {
    return (
        <Box sx={{ pt: 5 }}>
            <GradientTitle>
                {title ? <Typography variant="h2">{title}</Typography> : header} 
            </GradientTitle>
            <Container>
                {children}
            </Container >
        </Box>
    )
}

export default BannerPage;