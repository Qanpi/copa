let config = {};

config.database = {
  id: "Copa Autumn 2023",
};

config.containers = [
  {
    id: "players",
    // uniqueKeyPolicy: {
    //     uniqueKeys: [
    //         { paths: "/player_id" }
    //     ]
    // }
    // partitionKey: {
    //     kind: "Hash",
    //     path: "/teams_id"
    // }
  },
  {
    id: "teams",
  },
  {
    id: "matches",
  },
];

config.player = {
    id: "0001",
    fname: "Aleksei",
    lname: "Terin",
    team_id: "",
    goals: "2",
    cleanSheets: "1"
}

export default config;
