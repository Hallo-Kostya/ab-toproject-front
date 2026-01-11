'use client';

import { useState, useEffect, useCallback } from 'react';
import MeetingList from "@/components/features/meetings/meeting-list";
import TeamCard from "@/components/ui/cards/team-card";
import PageContainer from "@/components/containers/page-container";
import { Team, TeamStudent } from "@/types/teams/team";
import { getTeams } from "@/lib/api/teams";
import { getFullTeamStudents } from "@/lib/api/students";
import { useAuth } from "@/context/AuthContext";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsWithStudents, setTeamsWithStudents] = useState<Array<Team & { students: TeamStudent[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Функция получения студентов для команд
  const fetchTeamsStudents = useCallback(async (teamsData: Team[]) => {
    try {
      setStudentsLoading(true);
      
      const studentsPromises = teamsData.map(async (team) => {
        try {
          const students = await getFullTeamStudents(team.id);
          return { ...team, students };
        } catch (error) {
          console.warn(`Failed to get students for team ${team.id}:`, error);
          return { ...team, students: [] };
        }
      });

      const teamsWithStudentsData = await Promise.all(studentsPromises);
      setTeamsWithStudents(teamsWithStudentsData);
    } catch (error) {
      console.error('Failed to fetch teams students:', error);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  const renderTeamCard = useCallback((team: Team & { students: TeamStudent[] }, index: number) => (
    <TeamCard 
      key={team.id}
      id={team.id}
      name={team.name}
      teamNumber={index + 1}
      participants={team.students} 
      studentCount={team.students.length}    />
  ), []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getTeams();
        setTeams(data);
        
        // Начинаем загружать студентов для команд
        if (data.length > 0) {
          fetchTeamsStudents(data);
        } else {
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

    fetchTeams();
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
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <PageContainer
      pageTag="teams"
      meetingsTitle="Предстоящие встречи"
      meetingsListComponent={<MeetingList />}
      listHeader="Всего команд найдено: "
      list={teamsWithStudents}
      cardComponent={renderTeamCard}
    />
  );
}