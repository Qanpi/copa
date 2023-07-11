import { Calendar, dayjsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import dayjs from "dayjs";
//rbc styling
import "./css/agenda.css";
import "./css/event.css";
import "./css/month.css";
import "./css/reset.css";
import "./css/styles.css";
import "./css/time-column.css";
import "./css/time-grid.css";
import "./css/toolbar.css";
import "./css/variables.css";
import "./css/dndstyles.css";

const localizer = dayjsLocalizer(dayjs);

const myEventsList = [
  {
    start: new Date(),
    end: new Date(),
    title: "Announced",
  },
];

const eventStyleGetter = (event, start, end, isSelected) => {
  if (start.getTime() == end.getTime()) {
    return {
        className: "point-event",
      style: {
        backgroundColor: "red",
        height: "1px",
        border: "",
        color: "red",
      },
    };
  }
};

const onEventResize = (data) => {
  const { start, end } = data;

  myEventsList[0].start = start;
  myEventsList[0].end = end;
};

const onEventDrop = (data) => {
  console.log(data);
};

const DnDCalendar = withDragAndDrop(Calendar);

const AdminCalendar = (props) => (
  <DnDCalendar
    localizer={localizer}
    events={myEventsList}
    startAccessor="start"
    endAccessor="end"
    onEventDrop={onEventDrop}
    onEventResize={onEventResize}
    eventPropGetter={eventStyleGetter}
  />
);

export default AdminCalendar;
