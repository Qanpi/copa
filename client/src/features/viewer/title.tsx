import { Box } from "@mui/material";
import { ReactNode } from "react";

function GradientTitle({ children }: { children?: ReactNode }) {
    return (
        <Box sx={{
            background: "linear-gradient(150deg, var(--copa-aqua), 20%, var(--copa-purple) 55%, 80%, var(--copa-pink))",
            width: "100vw",
            height: "100px",
            marginBottom: 7,
        }}>
            {children}
        </Box>
    )
}

export default GradientTitle;