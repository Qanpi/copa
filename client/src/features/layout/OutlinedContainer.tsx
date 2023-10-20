import { Container, ContainerProps, Typography, useTheme } from "@mui/material";

function OutlinedContainer({ title, children, sx, ...props }: ContainerProps & {title?: string}) {
    const theme = useTheme();

    return <Container maxWidth="md" sx={{ border: `1px solid ${theme.palette.primary.main}`, p:3, pt:2, borderRadius: 2, ...sx }} {...props}>
        {title ? <Typography variant="h6" color="primary">Preferences</Typography> : null} 
        {children}
    </Container>
}

export default OutlinedContainer;