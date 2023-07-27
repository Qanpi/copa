import {
  Checkbox,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography
} from "@mui/material";
import { useState } from "react";

function MyChecklist({ items, heading }) {
  return (
    <>
      <h2>{heading}</h2>
      <List sx={{ width: "300px", height: "300px" }}>
        {items.map((i, id) => (
          <ExpandableListItem
            id={id}
            key={id}
            name={i.name}
            descr={i.description}
          ></ExpandableListItem>
        ))}
      </List>
    </>
  );
}

const ExpandableListItem = ({ id, name, descr }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEvent = (newBool) => {
    setIsOpen(b => newBool);
  };

  return (
    <
    >
      <ListItem disablePadding
      
      onMouseEnter={() => handleMouseEvent(true)}
      onMouseLeave={() => handleMouseEvent(false)}
      >
        <ListItemButton>
          <Checkbox disabled></Checkbox>
          <ListItemText>{name}</ListItemText>
        </ListItemButton>
      </ListItem>
      {descr ? (
        <Collapse sx={{ pl: 8 }} in={isOpen}>
          <Typography component="div">{descr}</Typography>
        </Collapse>
      ) : null}
    </>
  );
};

export default MyChecklist;
