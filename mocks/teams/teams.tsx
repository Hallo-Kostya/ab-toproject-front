import { Team } from "@/types/teams/team";

export const teams: Team[] = [
    {
        id: "0",
        project_id: "101",
        name: "nuggets",
        curator: "Иванов Алексей Степанович",
        team_group_link: "https://t.me/",
        team_artifacts: "https://github.com/Hallo-Kostya/ab-toproject-front",
        participantIds: [
            "8",
            "15",
            "14",
            "13"
        ],
        projectsIds: ["101"]
    },
    {
        id: "1",
        project_id: "102",
        name: "nitro",
        curator: "Алексеев Вячеслав Тимофеевич",
        team_group_link: "https://t.me/",
        team_artifacts: "https://github.com/Hallo-Kostya/Alpha_CRM_Backend",
        participantIds: [
            "4",
            "5",
            "6",
            "7"
        ],
        projectsIds: ["103"]
    },
    {
        id: "2",
        project_id: "103",
        name: "dreamers",
        curator: "Ломачев Степан Игоревич",
        team_group_link: "https://t.me/",
        team_artifacts: "",
        participantIds: [
            "9",
            "10",
            "11",
            "12"
        ],
        projectsIds: ["101", "102"]
    }
]