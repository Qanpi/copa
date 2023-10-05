import { Card, CardContent, Typography } from "@mui/material"

const NumberCard = ({number, children}) => {
    return (
            <Card>
              <CardContent>
                <Typography variant="h2">{number}</Typography>
                {children}
              </CardContent>
            </Card>
    )
}

export default NumberCard;