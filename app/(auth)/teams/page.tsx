'use client';

import { useState, useEffect } from 'react';
import MeetingList from "@/components/features/meetings/meeting-list";
import TeamCard from "@/components/ui/cards/team-card";
import PageContainer from "@/components/containers/page-container";
import { Team } from "@/types/teams/team";
import { getTeams } from "@/lib/api/teams";
import { useAuth } from "@/context/AuthContext";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const renderTeamCard = (team: Team, index: number) => (
    <TeamCard 
      id={team.id}
      name={team.name}
      teamNumber={index + 1}
      studentCount={0} // Пока не реализовано получение студентов для карточек
    />
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchTeams = async () => {
      try {
        setLoading(true);
        const data = await getTeams();
        setTeams(data);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки команд');
        console.error('Teams fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [isAuthenticated]);

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
      list={teams}
      cardComponent={renderTeamCard}
    />
  );
}