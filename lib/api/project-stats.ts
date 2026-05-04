// import { getProjectTeams } from "@/lib/api/projects";
// import { getFullTeamStudents } from "@/lib/api/students";

// export interface ProjectStats {
//   teamsCnt: number;
//   placesCnt: number;
// }

// export const getProjectStats = async (projectId: string): Promise<ProjectStats> => {
//   try {
//     // получаем команды проекта
//     const teams = await getProjectTeams(projectId);
    
//     // фильтруем только активные команды (со статусом "ACTIVE")
//     const activeTeams = teams.filter(team => team.status === "ACTIVE");
//     const teamsCnt = activeTeams.length;
    
//     // если нет активных команд, возвращаем нули
//     if (teamsCnt === 0) {
//       return { teamsCnt: 0, placesCnt: 0 };
//     }

//     // получаем студентов ТОЛЬКО для активных команд
//     const studentPromises = activeTeams.map(async (team) => {
//       try {
//         const teamId = team.team_id || team.id;
//         const students = await getFullTeamStudents(teamId);
//         return students.length;
//       } catch (error) {
//         console.warn(`Failed to get students for team ${team.team_id || team.id}:`, error);
//         return 0; // возвращаем 0 при ошибке, чтобы не сломать всю статистику
//       }
//     });

//     const studentsCounts = await Promise.all(studentPromises);
//     const placesCnt = studentsCounts.reduce((sum, count) => sum + count, 0);

//     return { teamsCnt, placesCnt };
//   } catch (error) {
//     console.error(`Failed to get stats for project ${projectId}:`, error);
//     // возвращаем нули при ошибке, чтобы не сломать отображение проекта
//     return { teamsCnt: 0, placesCnt: 0 };
//   }
// };