import { Box, BoxProps, alpha, useTheme } from "@mui/material";
import { ReactNode } from "react";

function GradientTitle({ children, sx, ...props }: { children?: ReactNode } & BoxProps) {
    const theme = useTheme();

    return (
        <Box sx={{
            background: "linear-gradient(150deg, var(--copa-aqua), 20%, var(--copa-purple) 55%, 80%, var(--copa-pink))",
            boxShadow: `${alpha(theme.palette.common.black, 0.5)} 0 0 10px`,
            width: "100vw",
            marginBottom: 7,
            ...sx
        }} padding={4}
            alignItems={"center"}
            display={"flex"}
            paddingLeft={"15vw"}
            {...props}>
            {children}
        </Box>
    )
}

export default GradientTitle;