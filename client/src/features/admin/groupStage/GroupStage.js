import MyChecklist from "../../inputs/checklist/MyChecklist";

const tasks = [
    {name: "Draw teams",
    description: "Allocate into groups"}
]
function GroupStage() {
    return (
        <>
        {/* maybe show groups and other related data */}
        {/* <AdminCalendar></AdminCalendar> */}
        <MyChecklist items={tasks}>

        </MyChecklist>
        </>
    )
}

export default GroupStage;