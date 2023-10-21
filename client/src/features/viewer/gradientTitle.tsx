import { Box, BoxProps } from "@mui/material";
import { ReactNode } from "react";

function GradientTitle({ children, sx, ...props }: { children?: ReactNode } & BoxProps) {
    //TODO: add box-shadow
    return (
        <Box sx={{
            background: "linear-gradient(150deg, var(--copa-aqua), 20%, var(--copa-purple) 55%, 80%, var(--copa-pink))",
            width: "100vw",
            marginBottom: 7,
            ...sx
        }} padding={4}
            alignItems={"center"}
            display={"flex"}
            justifyContent={"center"}
            {...props}>
            {children}
        </Box>
    )
}

export default GradientTitle;