import { Container, ContainerProps } from "@mui/material";

export const PromptContainer = (props: ContainerProps) => {
  const { children, sx: propsSx, ...rest } = props;

  return <Container sx={{ minHeight: "400px", alignItems: "center", display: "flex", flexDirection: "column", p: 5, ...propsSx }} {...rest}>
    {children}
  </Container>;
};
