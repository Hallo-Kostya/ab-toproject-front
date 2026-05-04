'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import MeetingCard from "@/components/ui/cards/meeting-card";
import { getMeetings, Meeting } from "@/lib/api/meetings";
import { getTeamById } from "@/lib/api/teams";
import { useAuth } from "@/context/AuthContext";

const mapApiStatusToDisplayStatus = (apiStatus: string): 'planned' | 'completed' | 'cancelled' => {
  switch (apiStatus?.toUpperCase()) {
    case 'SCHEDULED':
      return 'planned';
    case 'COMPLETED':
      return 'completed';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'planned';
  }
};

export default function MeetingList() {
  const [meetings, setMeetings] = useState<Array<Meeting & { teamName: string; displayStatus: 'planned' | 'completed' | 'cancelled' }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchMeetings = async () => {
      try {
        setLoading(true);
        setError(null);

        const meetingsData = await getMeetings();
        
        // Получаем данные о командах для каждой встречи параллельно
        const meetingsWithTeams = await Promise.all(
          meetingsData.map(async (meeting) => {
            try {
              const team = await getTeamById(meeting.team_id);
              return { 
                ...meeting, 
                teamName: team.name,
                displayStatus: mapApiStatusToDisplayStatus(meeting.status)
              };
            } catch (error) {
              console.error(`Failed to get team for meeting ${meeting.id}:`, error);
              return { 
                ...meeting, 
                teamName: 'Команда не найдена',
                displayStatus: mapApiStatusToDisplayStatus(meeting.status)
              };
            }
          })
        );
        
        // Реверсируем массив для правильной сортировки
        setMeetings([...meetingsWithTeams].reverse());
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки встреч');
        console.error('Error fetching meetings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [isAuthenticated]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading) return (
    <div className="text-gray-500 text-center py-4">Загрузка встреч...</div>
  );

  if (error) return (
    <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>
  );

  if (meetings.length === 0) return (
    <div className="text-gray-500 text-center py-4">Нет запланированных встреч</div>
  );

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Кнопки навигации */}
      <button 
        onClick={scrollLeft}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors ${isHovering ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        aria-label="Прокрутить влево"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto hide-scrollbar py-2 px-4 gap-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {meetings.map((meeting) => (
          <Link key={meeting.id} href={`/meeting/${meeting.id}`} className="flex-shrink-0 w-[290px] block">
            <MeetingCard 
              teamName={meeting.teamName}
              name={meeting.name}
              resume={meeting.resume}
              date={new Date(meeting.date).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
              time={new Date(meeting.date).toLocaleTimeString('ru-RU', {
                hour: '2-digit', minute: '2-digit', hour12: false
              })}
              status={meeting.displayStatus}
            />
          </Link>
        ))}
      </div>

      <button 
        onClick={scrollRight}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors ${isHovering ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        aria-label="Прокрутить вправо"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}