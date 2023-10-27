import { Close } from "@mui/icons-material";
import { ClickAwayListener, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import { ReactNode, createContext, useState } from "react";
import Markdown from "react-markdown";
import packageJson from "../../../package.json"

const markdown = `
- added notifications pane
- added tournament rules page
- added ability to change user name (real and display names)
- doubled word limit of a team's 'about' section
- integrated a service for easier feedback/bug reports 
- added this changelog
- minor bug fixes
    - pita/ruskea can keep their name as is :)
- reworked joining a team to be more intuitive/provide better feedback
- fixed layout issues (esp. on mobile)
- setup telemetry and [more](https://github.com/Qanpi/copa/releases/tag/v0.2.0)...
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
                    <Typography>Here's what's new:</Typography>
                    <Markdown>{markdown}</Markdown>
                </DialogContent>
            </Dialog >
            {children}
        </ChangeLogContext.Provider>
    )
}

export default ChangeLog;