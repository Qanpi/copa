import { Backdrop, Typography } from "@mui/material";
import { PromptContainer } from "../layout/PromptContainer";
import { useAuth } from "../user/hooks";
import { ReactNode } from "react";
import { LoadingBackdrop } from "../layout/LoadingBackdrop";
import NotFoundPage from "../layout/NotFoundPage";

function AdminOnlyPage({ children }: { children: ReactNode }) {
    const { data: user, status, isFetching } = useAuth();

    const isAdmin = user?.role === "admin";

    if (status !== "success") return <LoadingBackdrop open={true}></LoadingBackdrop>

    if (!isAdmin) {
        return <NotFoundPage></NotFoundPage>
    }

    return children;
}

export default AdminOnlyPage;