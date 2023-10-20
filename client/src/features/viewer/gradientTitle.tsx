import { Box, BoxProps } from "@mui/material";
import { ReactNode } from "react";

function GradientTitle({ children, ...props }: { children?: ReactNode } & BoxProps) {
    return (
        <Box sx={{
            background: "linear-gradient(150deg, var(--copa-aqua), 20%, var(--copa-purple) 55%, 80%, var(--copa-pink))",
            width: "100vw",
            marginBottom: 7,
        }} padding={3}
            alignItems={"center"}
            display={"flex"}
            justifyContent={"center"}
            {...props}>
            {children}
        </Box>
    )
}

export default GradientTitle;