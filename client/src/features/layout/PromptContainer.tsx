import { Container, ContainerProps } from "@mui/material";

export const PromptContainer = (props: ContainerProps) => {
  const { children, sx: propsSx, ...rest } = props;

  return <Container sx={{ minHeight: "600px", alignItems: "center", display: "flex", flexDirection: "column", pt: 10, ...propsSx }} {...rest}>
    {children}
  </Container>;
};
