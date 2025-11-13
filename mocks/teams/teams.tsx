import { Team } from "@/types/teams/team";

export const teams: Team[] = [
    {
        id: "0",
        project_id: "101",
        name: "RadikUlitki",
        curator: "Curator 1",
        team_group_link: "Link...",
        team_artifacts: "Some artifacts...",
        participantIds: [
            "0",
            "1",
            "2",
            "3"
        ]
    },
    {
        id: "1",
        project_id: "102",
        name: "Team 2",
        curator: "Curator 2",
        team_group_link: "Link...",
        team_artifacts: "Some artifacts...",
        participantIds: [
            "4",
            "2",
            "0",
            "3"
        ]
    },
    {
        id: "2",
        project_id: "103",
        name: "Team 3",
        curator: "Curator 3",
        team_group_link: "Link...",
        team_artifacts: "Some artifacts...",
        participantIds: [
            "1",
            "0",
            "3",
            "4",
            "2"
        ]
    }
]