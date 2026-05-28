'use client';

import { useState, useEffect, useCallback } from 'react';
import TeamCard from "@/components/ui/cards/team-card";
import PageContainer from "@/components/containers/page-container";
import { 
  TeamSummary, 
  TeamSummaryResponse, 
  TeamMemberSummary,
  getTeams,
  parseFullName
} from "@/lib/api/teams";
import { Student } from "@/lib/api/students";
import { useAuth } from "@/context/AuthContext";
import MeetingList from '@/components/features/meetings/meeting-list';
import TeamFormModal from '@/components/ui/teamFormModal';

interface TeamWithStudents extends TeamSummary {
  students: Student[];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamWithStudents[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const processTeamsWithStudents = useCallback((teamsData: TeamSummary[]): TeamWithStudents[] => {
    return teamsData.map(team => {
      if (team.members && team.members.length > 0) {
        const students: Student[] = team.members.map((member: TeamMemberSummary) => {
          const { first_name, last_name, patronymic } = parseFullName(member.full_name);
          return {
            id: member.id,
            first_name,
            last_name,
            patronymic: patronymic || '',
            email: '',
            tg_link: ''
          };
        });
        return { ...team, students };
      }
      return { ...team, students: [] };
    });
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response: TeamSummaryResponse = await getTeams();
      const teamsWithStudents = processTeamsWithStudents(response.teams);
      setTeams(teamsWithStudents);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки команд');
      console.error('Teams fetch error:', err);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [processTeamsWithStudents]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchTeams();
  }, [isAuthenticated, fetchTeams]);

  const handleTeamCreated = useCallback(() => {
    fetchTeams();
    setIsTeamModalOpen(false);
  }, [fetchTeams]);

  // TODO: Fix
  const renderTeamCard = useCallback((team: TeamWithStudents, index: number) => (
    <TeamCard 
      key={team.id}
      id={team.id}
      name={team.name}
      teamNumber={index + 1}
      participants={team.students}
      studentCount={team.members_count}
    />
  ), []);

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

  // TODO: Fix
  return (
    <>
      <PageContainer
        pageTag="teams"
        meetingsTitle="Предстоящие встречи"
        meetingsListComponent={<MeetingList />}
        listHeader="Всего команд найдено: "
        list={teams}
        cardComponent={renderTeamCard}
        addButton={{
          label: 'Добавить команду',
          onClick: () => setIsTeamModalOpen(true)
        }}
      />

      <TeamFormModal 
        isOpen={isTeamModalOpen} 
        onClose={() => setIsTeamModalOpen(false)}
        onSuccess={handleTeamCreated}
      />
    </>
  );
}