import { Box, Card, CardContent, CardProps, Container, Typography } from "@mui/material"

const NumberCard = ({ number, children, ...rest }: {number: number} & CardProps) => {
  return (
    <Card {...rest}>
      <CardContent>
        <Typography variant="h2">{number}</Typography>
        {children}
      </CardContent>
    </Card>
  )
}

export default NumberCard;