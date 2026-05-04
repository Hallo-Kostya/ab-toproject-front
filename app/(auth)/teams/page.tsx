'use client';

import { useState, useEffect, useCallback } from 'react';
import TeamCard from "@/components/ui/cards/team-card";
import PageContainer from "@/components/containers/page-container";
import { TeamSummary, TeamSummaryResponse, getTeams } from "@/lib/api/teams";
import { Student, getTeamStudents } from "@/lib/api/students";
import { useAuth } from "@/context/AuthContext";
import MeetingList from '@/components/features/meetings/meeting-list';

// Расширяем TeamSummary для отображения в карточке
interface TeamWithStudents extends TeamSummary {
  students: Student[];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamWithStudents[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Функция получения студентов для команд
  const fetchTeamsStudents = useCallback(async (teamsData: TeamSummary[]) => {
    try {
      setStudentsLoading(true);
      
      const studentsPromises = teamsData.map(async (team) => {
        try {
          if (team.members && team.members.length > 0) {
            // Маппим members в формат Student для совместимости с TeamCard
            const students: Student[] = team.members.map(m => ({
              id: m.id,
              first_name: m.first_name,
              last_name: m.last_name,
              patronymic: '',
              email: '',
              tg_link: ''
            }));
            return { ...team, students };
          }

          const students = await getTeamStudents(team.id);
          return { ...team, students };
        } catch (error) {
          console.warn(`Failed to get students for team ${team.id}:`, error);
          return { ...team, students: [] };
        }
      });

      const teamsWithStudentsData = await Promise.all(studentsPromises);
      setTeams(teamsWithStudentsData);
    } catch (error) {
      console.error('Failed to fetch teams students:', error);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  const renderTeamCard = useCallback((team: TeamWithStudents, index: number) => (
    <TeamCard 
      key={team.id}
      id={team.id}
      name={team.name}
      teamNumber={index + 1}
      participants={team.students}
      studentCount={team.member_count}
    />
  ), []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchTeamsData = async () => {
      try {
        setLoading(true);
        setError(null);
 
        const response: TeamSummaryResponse = await getTeams();

        const teamsData = response.items;
        
        if (teamsData.length > 0) {
          await fetchTeamsStudents(teamsData);
        } else {
          setTeams([]);
          setStudentsLoading(false);
        }
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки команд');
        console.error('Teams fetch error:', err);
        setStudentsLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamsData();
  }, [isAuthenticated, fetchTeamsStudents]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#000150]">Загрузка команд...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <PageContainer
      pageTag="teams"
      meetingsTitle="Предстоящие встречи"
      meetingsListComponent={<MeetingList />}
      listHeader="Всего команд найдено: "
      list={teams}
      cardComponent={renderTeamCard}
    />
  );
}