import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import MyNumberSlider from "../../../../components/MyNumberSlider/mynumberslider";
import MyTextField from "../../../../components/MyTextField/mytextfield";
import { Button, Input, InputLabel } from "@mui/material";
import { useField } from "formik";
import MyFileInput from "../../../../components/MyFileInput/myFileInput";

function KickstartPage() {
  const queryClient = useQueryClient();

  const createTournament = useMutation({
    mutationFn: async (tournamentData) => {
      const res = await axios.post("/api/tournaments", tournamentData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tournament", "current"]);
    },
  });

  return (
    <Formik
      initialValues={{
        settings: {
          playerCount: 4,
          matchLength: 6,
        },
        organizer: {
          name: "",
          phoneNumber: "",
        },
        rules: "",
      }}
      validationSchema={Yup.object({
        settings: Yup.object({
          playerCount: Yup.number().min(1).max(11).required(),
          matchLength: Yup.number().min(1).max(20).required(),
        }),
        organizer: Yup.object({
          name: Yup.string().required(),
          phoneNumber: Yup.string().notRequired(),
        }),
        rules: Yup.string().required(),
      })}
      onSubmit={(values) => createTournament.mutate(values)}
    >
      <Form>
        <h1>Kickstart a new coap tournametn</h1>
        <div className="settings-wrapper">
          <MyNumberSlider
            label="Match length"
            name="settings.matchLength"
            units="mins"
            min={1}
            max={20}
            step={1}
            marks={[
              { value: 1, label: "1 min" },
              { value: 6, label: "6 min" },
              { value: 20, label: "20 min" },
            ]}
          />
          <MyNumberSlider
            label="Player count"
            name="settings.playerCount"
            units="players"
            required
            min={1}
            max={11}
            step={1}
            marks={[
              { value: 1, label: "1 p" },
              { value: 4, label: "4 p" },
              { value: 11, label: "11 p" },
            ]}
          />
        </div>
        <h2>RULES</h2>
        <MyFileInput label="please enter rules" name="rules"></MyFileInput>
        <p>
          TIP: The rules should answer questions including but{" "}
          <b>not limited</b> to,
        </p>
        <ol>
          <li>How do throw-ins, substitutions etc. work?</li>
          <li>What are the punishments for violating rules?</li>
          <li>What about not showing up on time?</li>
        </ol>
        <h2>CONTACTS</h2>
        <MyTextField
          type="text"
          name="organizer.name"
          label="Organizer's name"
        ></MyTextField>
        <MyTextField
          type="tel"
          name="organizer.phoneNumber"
          label="Phone number"
        ></MyTextField>
        <Button type="submit">Submit</Button>
      </Form>
    </Formik>
  );
}


export default KickstartPage;
