import { Close } from "@mui/icons-material";
import { ClickAwayListener, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import { ReactNode, createContext, useState } from "react";
import Markdown from "react-markdown";
import packageJson from "../../../package.json"

const markdown = `
Here's what's new: 
- added this element
- also added this
- and made this feature you can use [here](google.com)
`
const latest = packageJson.version;

export const ChangeLogContext = createContext<((b: boolean) => void)>(null);

function ChangeLog({ children }: { children: ReactNode }) {
    const v = localStorage.getItem("version");

        //check only for minor and major release updates, not patches
    const update = latest.charAt(2) !== v?.charAt(2)
    const [open, setOpen] = useState(update);

    const handleClose = () => {
        localStorage.setItem("version", latest);
        setOpen(false);
    }

    return (
        <ChangeLogContext.Provider value={(b: boolean) => setOpen(b)}>
            <Dialog open={open} onClose={handleClose}> 
                <DialogTitle sx={{mr: 5}}>
                    {!update ? `This is Copa v${latest}!` : `A new version of Copa just dropped!   `}
                </DialogTitle>
                <IconButton onClick={handleClose} sx={{ position: "absolute", top: 12, right: 10 }}>
                    <Close></Close>
                </IconButton>
                <DialogContent>
                    <Markdown>{markdown}</Markdown>
                </DialogContent>
            </Dialog >
            {children}
        </ChangeLogContext.Provider>
    )
}

export default ChangeLog;