import { Button } from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useTournament } from "../../hooks.ts";
import MyFileInput from "../../../inputs/fileInput/MyFileInput.js";
import MyNumberSlider from "../../../inputs/numberSlider/myNumberSlider.js";
import MyTextField from "../../../inputs/textField/mytextfield.js";
import { useUpdateTournament } from "../dashboard/Dashboard.js";

function SettingsStage() {
  const { data: tournament } = useTournament("current");
  const updateTournament = useUpdateTournament(tournament?.id);

  return (
    <Formik
      initialValues={tournament}
      validationSchema={Yup.object({
        settings: Yup.object({
          playerCount: Yup.number().min(1).max(11).required(),
          matchLength: Yup.number().min(1).max(20).required(),
        }),
        organizer: Yup.object({
          name: Yup.string().required(),
          phoneNumber: Yup.string().notRequired(),
        }),
        rules: Yup.string().optional(), //TODO: at lfor time being
      })}
      onSubmit={(values) => {
        updateTournament.mutate(values);
      }}
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
        <MyFileInput label="please enter rules" name="rrules"></MyFileInput>
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
        <Button type="submit">Save</Button>
      </Form>
    </Formik>
  );
}

export default SettingsStage;
