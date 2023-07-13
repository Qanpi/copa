import { Select } from "@mui/material";
import { useField } from "formik"

const MySelect = ({children, ...props}) => {
    const [field, meta] = useField(props);

    return (
        <Select {...field} {...meta}>
            {children}
        </Select>
    )
}

export default MySelect;