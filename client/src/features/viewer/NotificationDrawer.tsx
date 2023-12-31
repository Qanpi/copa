import { CloseOutlined, ErrorOutline, InfoOutlined, NotificationAdd, Notifications, TaskAltOutlined, WarningAmberOutlined } from "@mui/icons-material";
import { Alert, AlertProps, AlertTitle, Badge, Box, Button, Drawer, IconButton, InputBase, List, ListItem, ListItemText, MenuItem, Paper, Select, Stack, SwipeableDrawer, Typography, useTheme } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useTournament } from "../tournament/hooks";
import { TNotification } from "@backend/models/tournament";
import MyTextField from "../inputs/myTextField";
import { Formik, Form } from "formik";
import * as Yup from "yup"
import { queryKeyFactory } from "../types";
import dayjs from "dayjs";
import { useAuth } from "../user/hooks";

const notificationKeys = queryKeyFactory<TNotification>("notifications");

function NotificationDrawer() {
    const [open, setOpen] = useState(false);

    const [openNewPreview, setOpenNewPreview] = useState(false);

    const { data: tournament } = useTournament("current");

    const queryClient = useQueryClient();
    const { data: notifications } = useQuery({
        queryKey: notificationKeys.all,
        queryFn: async () => {
            const res = await axios.get(`/api/tournaments/${tournament.id}/notifications`);
            return res.data as TNotification[];
        },
        enabled: Boolean(tournament?.id)
    })

    const lastSeen = localStorage.getItem("lastOpenedNotifications");

    let unseenCount = 0;
    const classifiedNotifications = notifications?.map(n => {
        if (dayjs(n.createdAt) > (lastSeen ? dayjs(lastSeen) : 0)) {
            unseenCount++;
            return { ...n, seen: false };
        }
        return { ...n, seen: true };
    }
    );

    const createNotification = useMutation({
        mutationFn: async (values: TNotification) => {
            const res = await axios.post(`/api/tournaments/${tournament.id}/notifications`, values);
        },
        async onMutate(variables: TNotification) {
            await queryClient.cancelQueries()

            const previous = queryClient.getQueryData(notificationKeys.all);

            queryClient.setQueryData(notificationKeys.all, (old: TNotification[] | undefined) => [variables, ...(old || [])]);

            return { previous };
        },
        onError(err, variables, context) {
            queryClient.setQueryData(notificationKeys.all, context?.previous);
        },
        onSettled() {
            queryClient.invalidateQueries(notificationKeys.all);
        }
    })

    const deleteNotification = useMutation({
        mutationFn: async (id: string) => {
            const res = await axios.delete(`/api/tournaments/${tournament.id}/notifications/${id}`);
        },
        async onMutate(id) {
            await queryClient.cancelQueries();

            const previous = queryClient.getQueryData(notificationKeys.all);

            queryClient.setQueryData(notificationKeys.all, (old: TNotification[] | undefined) => old?.filter(n => n._id !== id));

            return { previous }
        },
        onError(err, variables, context) {
            queryClient.setQueryData(notificationKeys.all, context?.previous);
        },
        onSettled() {
            queryClient.invalidateQueries(notificationKeys.all);
        }
    })

    const theme = useTheme();

    const handleSubmitNotification = (values: TNotification) => {
        createNotification.mutate(values);
        setOpenNewPreview(false);
    }

    const handleDeleteNotification = (id: string) => {
        deleteNotification.mutate(id);
    }

    const handleToggleNotifications = (b: boolean) => {
        setOpen(b);
        if (!b) localStorage.setItem("lastOpenedNotifications", dayjs().toISOString());
    }

    const { data: auth } = useAuth();
    const isAdmin = auth?.role === "admin";

    return (
        <>
            <IconButton sx={{mr: {xs: -1, md: 1}}} onClick={() => handleToggleNotifications(!open)}>
                <Badge color="primary" badgeContent={unseenCount || 0}>
                    <Notifications></Notifications>
                </Badge>
            </IconButton>

            <SwipeableDrawer
                open={open}
                anchor="left"
                onOpen={() => handleToggleNotifications(true)}
                onClose={() => handleToggleNotifications(false)}
                PaperProps={{
                    sx: {
                        background: theme.palette.primary.dark,
                        width: "min(85vw, 500px)",
                    }
                }}
            >
                <List dense>
                    {openNewPreview ? <Formik validationSchema={Yup.object({
                        title: Yup.string().required(),
                        body: Yup.string().max(500)
                    })} initialValues={{
                        title: "",
                        body: "",
                        severity: "info"
                    }} onSubmit={handleSubmitNotification}>
                        {({ values, setFieldValue }) =>
                            <Form>
                                <ListItem sx={{ mb: 2 }}>
                                    <Stack direction="column" spacing={1} sx={{ width: "100%" }}>
                                        <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                                            <Select sx={{ pl: 1 }} input={<InputBase></InputBase>} value={values.severity} onChange={(event) => setFieldValue("severity", event.target.value)}>
                                                <IconButton value="info">
                                                    <InfoOutlined color="info"></InfoOutlined>
                                                </IconButton>
                                                <IconButton value="success">
                                                    <TaskAltOutlined color="success"></TaskAltOutlined>
                                                </IconButton>
                                                <IconButton value="warning">
                                                    <WarningAmberOutlined color="warning"></WarningAmberOutlined>
                                                </IconButton>
                                                <IconButton value="error">
                                                    <ErrorOutline color="error"></ErrorOutline>
                                                </IconButton>
                                            </Select>
                                            <MyTextField fullWidth placeholder="Title" variant="standard" name="title"></MyTextField>
                                        </Stack>
                                        <MyTextField multiline maxRows={4} minRows={2} placeholder="Message" name="body"></MyTextField>
                                        <Stack direction="row" spacing={1}>
                                            <Button onClick={() => setOpenNewPreview(false)} variant="outlined" color="secondary">Cancel</Button>
                                            <Button type="submit" fullWidth variant="contained" color="secondary">Send out</Button>
                                        </Stack>
                                    </Stack>
                                </ListItem>
                            </Form>}
                    </Formik> :
                        (isAdmin ? <ListItem>
                            <Paper>
                                <Button onClick={() => setOpenNewPreview(true)}>
                                    <NotificationAdd sx={{ mr: 1 }}></NotificationAdd>
                                    Create new
                                </Button>
                            </Paper>
                        </ListItem> : null)
                    }
                    {classifiedNotifications?.map((n, i) => {
                        return (
                            <ListItem sx={{ opacity: (n.seen ? 0.85 : 1) }}>
                                <Alert severity={n.severity} sx={{ width: "100%", "& .MuiAlert-message": { width: "100%", pb: 0 } }}
                                >
                                    <AlertTitle>{n.title}</AlertTitle>
                                    {n.body}
                                    <Typography textAlign="right" variant="body2" color="GrayText">{dayjs(n.createdAt).format("HH:MM, DD/MM")}</Typography>
                                    {isAdmin ? <IconButton size="small" sx={{ position: "absolute", top: 5, right: 15 }} onClick={() => handleDeleteNotification(n._id)}>
                                        <CloseOutlined fontSize="small"></CloseOutlined>
                                    </IconButton> : null}
                                </Alert>
                            </ListItem>
                        )
                    })}
                    {classifiedNotifications?.length === 0 ? <Typography textAlign="center" sx={{mt: 2}}>No notifications yet.</Typography> : null}
                </List >
            </SwipeableDrawer >
        </>
    )
}

export default NotificationDrawer;