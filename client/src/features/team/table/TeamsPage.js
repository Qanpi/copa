import { Tooltip, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { CalendarIcon } from "@mui/x-date-pickers";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { useTournament } from "../../tournament/helpers";
import { useParticipants } from "../../participant/hooks";
import { useUnregisterTeam } from "../registration/registration";
import { NotEnoughParticipantsAlert } from "./ParticipantsTable";

export function TeamsPage() {
  const { data: participants, status: participantsStatus } = useParticipants();
  const unregisterTeam = useUnregisterTeam();
  const { data: tournament, status: tournamentStatus } = useTournament("current");

  const cols = [
    {
      field: "name",
      headerName: "Team name",
      width: 200,
      //is encoding fine?
      renderCell: (params) => (
        <Link to={`/teams/${params.row.name}`}>{params.value}</Link>
      ),
    },
    {
      field: "division",
      headerName: "Division",
      editable: true,
      valueOptions: tournament?.divisions,
      type: "singleSelect",
    },
    {
      field: "phoneNumber",
      headerName: "Contact number",
      width: 150,
    },
    {
      field: "createdAt",
      headerName: "Registered",
      type: "dateTime",
      valueGetter: (p) => new Date(p.value),
      width: 200,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: (params) => {
        return [
          <Tooltip title="Unregister">
            <GridActionsCellItem
              onClick={() => unregisterTeam.mutate({ id: params.row.id })}
              icon={<CalendarIcon></CalendarIcon>}
              label="Revoke registration"
            ></GridActionsCellItem>
          </Tooltip>,
        ];
      },
    },
  ];
  const updateParticipation = useMutation({
    mutationFn: async (values) => {
      const res = await axios.put(`/api/participations/${values.id}`, values);
      return res.data;
    },
  });

  if (participantsStatus !== "success") return <p>Loading...</p>;

  if (tournamentStatus !== "success") return <p>Loading...</p>;

  return (
    <div sx={{ width: "80%" }}>
      <Typography>Teams</Typography>

      <Formik
        initialValues={{
          registration: {
            from: tournament.registration.from
              ? dayjs(tournament.registration.from)
              : null,
            to: tournament.registration.to
              ? dayjs(tournament.registration.to)
              : null,
          },
        }}
        validationSchema={Yup.object({
          registration: Yup.object({
            from: Yup.date().required(),
            to: Yup.date()
              .required()
              .when(["from"], ([from], schema) => {
                if (from) return schema.min(dayjs(from).add(1, "day")); //can't be on the same day
              }),
          }),
        })}
        onSubmit={(values) => {
          updateTournament.mutate(values);
        }}
      >
        <Form>
          <NotEnoughParticipantsAlert
            open={alertOpen}
          ></NotEnoughParticipantsAlert>
          <div className="registration">
            <InputLabel>Open registration</InputLabel>
            <MyDatePicker disablePast label="from" name="registration.from" />
            <MyDatePicker
              disablePast
              label="to"
              name="registration.to"
              minDate={values.registration.from?.add(1, "day")} />
          </div>

          <Button type="submit">Confirm</Button>
          <Card sx={{ width: 1 / 2, height: 200 }}>
            <CardContent>
              <Typography variant="h3">{participants?.length}</Typography>
              <Typography>currently registered</Typography>
            </CardContent>
          </Card>
          <Button onClick={handleClickNextStage}>Next Stage</Button>
        </Form>
      </Formik>
      <DataGrid
        editMode="row"
        isCellEditable={(params) => params.row.tournament === tournament?.id}
        autoheight
        rows={participants}
        columns={cols}
        processRowUpdate={async (newRow, orig) => {
          const res = await updateParticipation.mutateAsync(newRow);
          return res;
        }}
        onProcessRowUpdateError={(err) => console.log(err)}
      ></DataGrid>
    </div>
  );
}
