'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { format, addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getMeetings, Meeting } from '@/lib/api/meetings';
import { getTeams, TeamSummaryResponse } from '@/lib/api/teams';
import 'react-day-picker/style.css';

// Маппинг статусов для отображения
// const getStatusConfig = (status: string) => {
//   switch (status?.toUpperCase()) {
//     case 'SCHEDULED':
//       return { label: 'Запланирована', color: 'bg-[#E79E00]/20 text-[#E79E00]' };
//     case 'COMPLETED':
//       return { label: 'Завершена', color: 'bg-green-100 text-green-700' };
//     case 'CANCELED':
//       return { label: 'Отменена', color: 'bg-red-100 text-red-700' };
//     case 'IN_PROGRESS':
//       return { label: 'В работе', color: 'bg-blue-100 text-blue-700' };
//     default:
//       return { label: 'Запланирована', color: 'bg-[#E79E00]/20 text-[#E79E00]' };
//   }
// };

// Компонент карточки встречи в календаре
function MeetingItem({ meeting }: { meeting: Meeting }) {
//   const status = getStatusConfig(meeting.status);
  const time = format(new Date(meeting.date), 'HH:mm');

  return (
    <Link
      href={`/meeting/${meeting.id}`}
      className="block p-2 rounded-lg bg-[#000150]/2 hover:bg-[#000150]/5 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#000150] truncate group-hover:underline">
            {meeting.name}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">{time}</p>
        </div>
        {/* <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${status.color}`}>
          {status.label}
        </span> */}
      </div>
    </Link>
  );
}

// Компонент ячейки дня с встречами
function DayCell({ date, meetings }: { date: Date; meetings: Meeting[] }) {
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const dayMeetings = useMemo(() => 
    meetings.filter(m => format(new Date(m.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [meetings, date]
  );

  return (
    <div className={`min-h-28 p-2 border border-gray-100 rounded-lg ${isToday ? 'bg-[#000150]/5 border-[#000150]/30' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[12px] font-medium ${isToday ? 'text-[#000150]' : 'text-gray-600'}`}>
          {format(date, 'd')}
        </span>
        {isToday && (
          <span className="text-[10px] px-1.5 py-0.5 bg-[#000150] text-white rounded-full">
            Сегодня
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        {dayMeetings.length > 0 ? (
          dayMeetings.map(meeting => (
            <MeetingItem key={meeting.id} meeting={meeting} />
          ))
        ) : (
          <p className="text-[11px] text-gray-400 italic">Нет встреч</p>
        )}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { isAuthenticated } = useAuth();
  
  // Состояние для диапазона дат (неделя)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(addDays(new Date(), 6))
  });
  
  // Состояние для фильтра по команде
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [teams, setTeams] = useState<Array<{ id: string; name: string }>>([]);
  
  // Состояние для встреч и загрузки
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTeams, setLoadingTeams] = useState(true);

  // Загрузка списка команд для фильтра
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchTeams = async () => {
      try {
        setLoadingTeams(true);
        const response: TeamSummaryResponse = await getTeams();
        const teamList = response.teams.map(t => ({ id: t.id, name: t.name }));
        setTeams(teamList);
      } catch (err: any) {
        console.error('Failed to load teams:', err);
        setTeams([]);
      } finally {
        setLoadingTeams(false);
      }
    };
    
    fetchTeams();
  }, [isAuthenticated]);

  // Загрузка встреч при изменении диапазона или фильтра
  useEffect(() => {
    if (!isAuthenticated || !dateRange.from || !dateRange.to) return;
    
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // TODO: Fix
        const filters: { start_date: string; end_date: string; team_id?: string } = {
          start_date: dateRange.from.toISOString(),
          end_date: dateRange.to.toISOString()
        };
        
        if (selectedTeamId) {
          filters.team_id = selectedTeamId;
        }
        
        const data = await getMeetings(filters);
        setMeetings(data);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки встреч');
        console.error('Failed to load meetings:', err);
        setMeetings([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeetings();
  }, [isAuthenticated, dateRange, selectedTeamId]);

  // Навигация: неделя назад
  const handlePrevWeek = useCallback(() => {
    if (!dateRange.from || !dateRange.to) return;
    setDateRange({
      from: subDays(dateRange.from, 7),
      to: subDays(dateRange.to, 7)
    });
  }, [dateRange]);

  // Навигация: неделя вперёд
  const handleNextWeek = useCallback(() => {
    if (!dateRange.from || !dateRange.to) return;
    setDateRange({
      from: addDays(dateRange.from, 7),
      to: addDays(dateRange.to, 7)
    });
  }, [dateRange]);

  // Сброс фильтра команды
  const handleClearTeamFilter = useCallback(() => {
    setSelectedTeamId(null);
  }, []);

  // Генерация массива дней для отображения
  const weekDays = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return [];
    const days: Date[] = [];
    let current = dateRange.from;
    while (current <= dateRange.to) {
      days.push(new Date(current));
      current = addDays(current, 1);
    }
    return days;
  }, [dateRange]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#000150]">Войдите в систему для просмотра календаря</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
        {/* Заголовок и навигация */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-[20px] text-[#000150] font-semibold">Календарь встреч</h1>
            <div className="flex items-center gap-3">
                {/* Навигация по неделям */}
                <div className="flex items-center gap-2">
                <button
                    onClick={handlePrevWeek}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    aria-label="Неделя назад"
                >
                    <svg className="w-5 h-5 text-[#000150]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="text-[16px] text-[#000150] min-w-48 text-center">
                    {dateRange.from && dateRange.to 
                    ? `${format(dateRange.from, 'd MMM', { locale: ru })} - ${format(dateRange.to, 'd MMM yyyy', { locale: ru })}`
                    : 'Загрузка...'
                    }
                </span>
                <button
                    onClick={handleNextWeek}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    aria-label="Неделя вперёд"
                >
                    <svg className="w-5 h-5 text-[#000150]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                </div>
                
                {/* Фильтр по команде */}
                <div className="relative">
                <select
                    value={selectedTeamId || ''}
                    onChange={(e) => setSelectedTeamId(e.target.value || null)}
                    disabled={loadingTeams}
                    className="
                    appearance-none 
                    bg-white 
                    border border-gray-300 
                    rounded-xl 
                    px-4 py-2 
                    pr-8
                    text-[14px] 
                    text-[#000150] 
                    font-medium
                    cursor-pointer 
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-[#000150]/20 
                    focus:border-[#000150]
                    hover:border-[#000150]/50
                    transition-all
                    min-w-40
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    "
                >
                    <option value="">Все команды</option>
                    {loadingTeams ? (
                    <option disabled>Загрузка...</option>
                    ) : teams.length === 0 ? (
                    <option disabled>Нет команд</option>
                    ) : (
                    teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))
                    )}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
                </div>
                
                {/* Кнопка сброса фильтра */}
                {selectedTeamId && (
                <button
                    onClick={handleClearTeamFilter}
                    className="text-[13px] text-[#000150]/70 hover:text-[#000150] underline"
                >
                    Сбросить
                </button>
                )}
            </div>
        </div>
        
        {/* Статус загрузки/ошибки */}
        {loading && (
        <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-[#000150]">
                <div className="w-5 h-5 border-2 border-[#000150]/20 border-t-[#000150] rounded-full animate-spin" />
                <span>Загрузка встреч...</span>
            </div>
        </div>
        )}
        
        {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
            {error}
        </div>
        )}
        
        {/* Статистика */}
        {!loading && !error && meetings.length > 0 && (
            <div className="text-left text-[14px] text-gray-500">
                Найдено встреч: <span className="font-semibold text-[#000150]">{meetings.length}</span>
            </div>
        )}
        {/* Календарь */}
        {!loading && !error && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                {/* Дни недели */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                        <div key={day} className="text-center text-[13px] font-medium text-gray-500">
                            {day}
                        </div>
                    ))}
                </div>
                
                {/* Сетка дней */}
                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map(day => (
                        <DayCell key={day.toISOString()} date={day} meetings={meetings} />
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}