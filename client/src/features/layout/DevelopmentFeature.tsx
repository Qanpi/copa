import { useState } from "react";
import { FeedbackSnackbar } from "./FeedbackSnackbar";
import { TFeedback } from "../types";

function DevFeature() {
    const [feedback, setFeedback] = useState<TFeedback>({
        severity: "info",
        message: "This feature is still in development."
    })

    return (
        <FeedbackSnackbar feedback={feedback} onClose={() => setFeedback({})}></FeedbackSnackbar>
    )
}

export default DevFeature;