import MyChecklist from "../../../../components/MyChecklist/mychecklist";

const tasks = [
    {name: "Draw teams",
    description: "Allocate into groups"}
]
function GroupStagePage() {
    return (
        <>
        {/* maybe show groups and other related data */}
        {/* <AdminCalendar></AdminCalendar> */}
        <MyChecklist items={tasks}>

        </MyChecklist>
        </>
    )
}

export default GroupStagePage;