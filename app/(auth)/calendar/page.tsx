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
const getStatusConfig = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'SCHEDULED':
      return { label: 'Запланирована', color: 'bg-blue-100 text-blue-700 border border-blue-200' };
    case 'COMPLETED':
      return { label: 'Завершена', color: 'bg-green-100 text-green-700 border border-green-200' };
    case 'CANCELED':
      return { label: 'Отменена', color: 'bg-red-100 text-red-700 border border-red-200' };
    case 'IN_PROGRESS':
      return { label: 'В работе', color: 'bg-yellow-100 text-[#E79E00] border border-[#E79E00]/30' };
    default:
      return { label: 'Запланирована', color: 'bg-blue-100 text-blue-700 border border-blue-200' };
  }
};

// Компонент карточки встречи в календаре
function MeetingItem({ 
  meeting, 
  teamName 
}: { 
  meeting: Meeting; 
  teamName?: string 
}) {
  const status = getStatusConfig(meeting.status);
  const time = format(new Date(meeting.date), 'HH:mm');

  return (
    <Link
      href={`/meeting/${meeting.id}`}
      className="block p-3 rounded-xl bg-[#000150]/5 hover:bg-[#000150]/10 transition-colors group border border-gray-100 hover:border-[#000150]/20"
    >
      <div className="flex flex-col gap-2">
        {/* Верхняя строка: название */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-semibold text-[#000150] truncate group-hover:underline leading-tight">
            {meeting.name}
          </p>
        </div>
        
        {/* Средняя строка: команда */}
        {teamName && (
          <p className="text-[11px] text-gray-500 truncate">
            <span className="font-medium text-gray-600">Команда:</span> {teamName}
          </p>
        )}
        
        {/* Нижняя строка: время + статус в одну строку */}
        <div className="">
          <p className="text-[11px] text-[#000150]/50 flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {time}
          </p>
          <span className={`text-[10px] px-2 py-0.5 pb-1 rounded-full font-medium whitespace-nowrap shrink-0 ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Компонент ячейки дня с встречами
function DayCell({ 
  date, 
  meetings, 
  teamNamesMap 
}: { 
  date: Date; 
  meetings: Meeting[]; 
  teamNamesMap: Record<string, string> 
}) {
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  
  const dayMeetings = useMemo(() => 
    meetings
      .filter(m => format(new Date(m.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [meetings, date]
  );

  return (
    <div className={`min-h-56 p-2.5 border border-gray-100 rounded-xl ${isToday ? 'bg-[#000150]/5 border-[#000150]/30' : 'bg-white'} flex flex-col`}>
      {/* Заголовок дня */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
        <span className={`text-[13px] font-semibold ${isToday ? 'text-[#000150]' : 'text-gray-600'}`}>
          {format(date, 'd')}
        </span>
        <span className={`text-[12px] px-1.5 py-0.5 rounded-full ${isToday ? 'bg-[#000150] text-white' : 'bg-gray-100 text-gray-500'}`}>
          {format(date, 'eeee', { locale: ru })}
        </span>
      </div>
      
      {/* Список встреч — скролл скрыт, но работает */}
      <div className="flex-1 space-y-2 overflow-y-auto max-h-44 custom-scrollbar scrollbar-hide">
        {dayMeetings.length > 0 ? (
          dayMeetings.map(meeting => (
            <MeetingItem 
              key={meeting.id} 
              meeting={meeting} 
              teamName={teamNamesMap[meeting.team_id]} 
            />
          ))
        ) : (
          <p className="text-[11px] text-gray-400 italic text-center py-3">Нет встреч</p>
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Failed to load teams:', err);
        setTeams([]);
      } finally {
        setLoadingTeams(false);
      }
    };
    
    fetchTeams();
  }, [isAuthenticated]);

  const teamNamesMap = useMemo(() => {
    const map: Record<string, string> = {};
    teams.forEach(team => {
      map[team.id] = team.name;
    });
    return map;
  }, [teams]);

  // Загрузка встреч при изменении диапазона или фильтра
  useEffect(() => {
    if (!isAuthenticated || !dateRange.from || !dateRange.to) return;
    
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const fromDate = dateRange.from;
        const toDate = dateRange.to;
        if (!fromDate || !toDate) return;

        const filters: { start_date: string; end_date: string; team_id?: string } = {
          start_date: fromDate.toISOString(),
          end_date: toDate.toISOString()
        };

        if (selectedTeamId) {
          filters.team_id = selectedTeamId;
        }
        
        const data = await getMeetings(filters);
        setMeetings(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <div className="max-w-full mx-auto space-y-5">
        {/* Заголовок и навигация */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-[20px] text-[#000150] font-semibold">Календарь встреч</h1>
            <div className="flex items-center gap-4">
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
        <div className="text-center py-4">
            <div className="inline-flex items-center gap-1 text-[#000150]">
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
                {/* Дни недели */}
                {/* <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(day => (
                        <div key={day} className="text-center text-[13px] font-medium text-gray-500">
                            {day}
                        </div>
                    ))}
                </div> */}
                
                {/* Сетка дней */}
                <div className="grid grid-cols-7 gap-1">
                    {weekDays.map(day => (
                      <DayCell 
                        key={day.toISOString()} 
                        date={day} 
                        meetings={meetings} 
                        teamNamesMap={teamNamesMap}
                      />
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}