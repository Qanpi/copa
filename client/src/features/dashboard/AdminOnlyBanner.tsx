import { Typography } from "@mui/material";
import { PromptContainer } from "../layout/PromptContainer";
import { useAuth } from "../user/hooks";
import { ReactNode } from "react";

function AdminOnlyPage({children}: {children: ReactNode}) {
    const { data: user } = useAuth();

    const isAdmin = user?.role === "admin";

    if (!user || !isAdmin) {
        return (
            <PromptContainer>
                <Typography>Stop right there!</Typography>
                <Typography>This page is only available to admins.</Typography>
            </PromptContainer>
        )
    }

    return children;
}

export default AdminOnlyPage;