import { Meeting } from "@/types/meetings/meeting";

export const meetings: Meeting[] = [
    {
        id: "1",
        team_id: "1",
        project_id: "103",
        name: "Встреча №1",
        resume: "Обсуждение макетов и внесение правок",
        date: "25 декабря",
        time: "16:00",
        meeting_status: "planned",
        meeting_artifacts: [
            "https://drive.google.com/file/d/1abc123/view?usp=sharing",
            "https://docs.google.com/document/d/1def456/edit"
        ],
        notes: "Необходимо доработать макеты главной страницы и страницы профиля. Обсудить интеграцию с API карт.",
        tasks: [
            {
                id: "task1",
                description: "Сделать страницу регистрации",
                status: "completed",
                assignee_id: "5",
                due_date: "27.12.2025"
            },
            {
                id: "task2",
                description: "Сделать страницу авторизации",
                status: "in_progress",
                assignee_id: "5", 
                due_date: "28.12.2025"
            },
            {
                id: "task3",
                description: "Сделать страницу профиля",
                status: "not_started",
                assignee_id: "7",
                due_date: "29.12.2025"
            },
            {
                id: "task4",
                description: "Интеграция с картографическим API",
                status: "not_started",
                assignee_id: "6",
                due_date: "30.12.2025"
            }
        ],
        meeting_link: "https://meet.google.com/abc-defg-hij",
        duration: "1 час 30 минут",
        location: "Конференц-зал №3"
    },
]

