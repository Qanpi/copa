import { Box, Card, CardContent, CardProps, Container, ThemeProvider, Typography } from "@mui/material"
import { lightTheme } from "../..";

const NumberCard = ({ number, children, ...rest }: { number: number } & CardProps) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <Card sx={{
        minWidth: 190, 
        minHeight: 150,
        display: "flex",
        alignItems: "end"
      }} {...rest}>
        <CardContent>
          <Typography variant="h2">{number}</Typography>
          {children}
        </CardContent>
      </Card>
    </ThemeProvider>
  )
}

export default NumberCard;