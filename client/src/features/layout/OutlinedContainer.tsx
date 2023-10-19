import { Container, ContainerProps, useTheme } from "@mui/material";

function OutlinedContainer({ children, sx, ...props }: ContainerProps) {
    const theme = useTheme();

    return <Container maxWidth="md" sx={{ display: "flex", border: `1px solid ${theme.palette.primary.main}`, borderRadius: 2, ...sx }} {...props}>
        {children}
    </Container>
}

export default OutlinedContainer;