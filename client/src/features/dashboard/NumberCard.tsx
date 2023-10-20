import { Box, Card, CardContent, CardProps, Container, ThemeProvider, Typography } from "@mui/material"
import { lightTheme } from "../../themes";

const NumberCard = ({sx, number, children, ...rest }: { number: number } & CardProps) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <Card sx={{
        minWidth: 190,
        minHeight: 150,
        display: "flex",
        alignItems: "start",
        justifyContent: "end",
        flexDirection: "column",
        ...sx
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