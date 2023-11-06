import { Box, Typography, Container, BoxProps } from "@mui/material";
import { ReactNode } from "react";
import MatchesCalendar from "../match/MatchesCalendar";
import GradientTitle from "./gradientTitle";

function BannerPage({title, header, sx, children, ...props }: {title?: string, header?: ReactNode } & BoxProps) {
    return (
        <Box sx={{ pt: 5, ...sx}} {...props}>
            <GradientTitle>
                {title ? <Typography variant="h2">{title}</Typography> : header} 
            </GradientTitle>
            <Container sx={sx}>
                {children}
            </Container >
        </Box>
    )
}

export default BannerPage;