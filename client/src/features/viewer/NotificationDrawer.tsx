import { Notifications } from "@mui/icons-material";
import { Alert, AlertTitle, Badge, Drawer, IconButton, List, ListItem, ListItemText } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useTournament } from "../tournament/hooks";
import { TNotification } from "@backend/models/tournament";

function NotificationDrawer() {
    const [open, setOpen] = useState(false);

    const toggleDrawer = () => {
        setOpen(b => !b);
    }

    const { data: tournament } = useTournament("current");
    const { data: notifications } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await axios.get(`/api/tournament/${tournament.id}/notifications`);
            return res.data as TNotification[];
        },
        enabled: Boolean(tournament?.id)
    })

    return (
        <>
            <IconButton onClick={toggleDrawer}>
                <Badge color="primary" badgeContent={notifications?.length || 0}>
                    <Notifications></Notifications>
                </Badge>
            </IconButton>

            <Drawer
                open={open}
                anchor="left"
                onClose={toggleDrawer}
            >
                <List>
                    <ListItem>
                        {notifications?.map((n, i) => {
                            return (
                                <Alert>
                                    <AlertTitle>{n.title}</AlertTitle>
                                    {n.body}
                                </Alert>
                            )
                        })}
                    </ListItem>
                </List>

            </Drawer>
        </>
    )
}

export default NotificationDrawer;