// /app/interview/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ProjectApplication, 
  ApplicationStatus,
  ProjectApplicationFilters 
} from '@/lib/api/projectApplications';
import { getProjectApplications } from '@/lib/api/projectApplications';
import { getProjects } from '@/lib/api/projects';
import Image from 'next/image';

type TabType = 'applications' | 'interviews';
type SortDirection = 'asc' | 'desc' | null;
type ProjectFilterOption = {
  id: string;
  name: string;
};

export default function InterviewsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('applications');
  
  // Данные заявок
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Данные проектов для фильтра
  const [projectFilterOptions, setProjectFilterOptions] = useState<ProjectFilterOption[]>([]);
  const [, setProjectsLoading] = useState(false);
  
  // Состояния сортировки и фильтрации
  const [teamSort, setTeamSort] = useState<SortDirection>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Состояния dropdown-фильтров
  const [isProjectFilterOpen, setIsProjectFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  
  // Refs для закрытия dropdown при клике вне
  const projectFilterRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);

  // Загрузка проектов для фильтра (только когда открывается дропдаун)
  useEffect(() => {
    if (!isProjectFilterOpen || projectFilterOptions.length > 0) return;
    
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        const response = await getProjects();
        // Мапим только нужные поля для фильтра
        const options: ProjectFilterOption[] = response.projects.map(p => ({ 
          id: p.id, 
          name: p.name 
        }));
        setProjectFilterOptions(options);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Failed to load projects for filter:', err);
      } finally {
        setProjectsLoading(false);
      }
    };
    
    fetchProjects();
  }, [isProjectFilterOpen, projectFilterOptions.length]);

  // Закрытие dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectFilterRef.current && !projectFilterRef.current.contains(event.target as Node)) {
        setIsProjectFilterOpen(false);
      }
      if (statusFilterRef.current && !statusFilterRef.current.contains(event.target as Node)) {
        setIsStatusFilterOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Загрузка заявок для куратора
  useEffect(() => {
    if (activeTab !== 'applications') return;

    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filters: ProjectApplicationFilters = {
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          project_id: selectedProjectId || undefined,
        };
        
        const data = await getProjectApplications(filters);
        setApplications(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки заявок');
        console.error('Applications fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [activeTab, statusFilter, selectedProjectId]);

  // Обработчики
  const toggleSort = () => {
    setTeamSort(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc');
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsProjectFilterOpen(false);
  };

  const clearProjectFilter = () => {
    setSelectedProjectId(null);
  };

  const handleStatusSelect = (status: ApplicationStatus | 'ALL') => {
    setStatusFilter(status);
    setIsStatusFilterOpen(false);
  };

  // Фильтрация и сортировка на клиенте
  const filteredApplications = applications
    .sort((a, b) => {
      if (!teamSort) return 0;
      const nameA = a.team_name.toLowerCase();
      const nameB = b.team_name.toLowerCase();
      if (nameA < nameB) return teamSort === 'asc' ? -1 : 1;
      if (nameA > nameB) return teamSort === 'asc' ? 1 : -1;
      return 0;
    });

  // Заглушка для вкладки "Собеседования"
  if (activeTab === 'interviews') {
    return (
      <div className="min-h-screen flex flex-col gap-6">
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex items-center justify-center py-20">
          <div className="text-[20px] text-[#000150]/70 font-medium">
            🔧 Функционал в разработке
          </div>
        </div>
      </div>
    );
  }

  // Состояния загрузки/ошибки
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col gap-6">
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="space-y-4 px-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col gap-6">
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mx-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col gap-6">
      {/* Переключатель вкладок */}
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Шапка таблицы с фильтрами */}
      <div className="flex justify-between gap-4 px-4 py-3 rounded-xl border-b border-gray-200 shadow-sm">
        {/* Команда + сортировка */}
        <div className="flex items-center gap-2">
          <span className="text-[20px] font-semibold text-[#000150]">Команда</span>
          <button 
            onClick={toggleSort}
            className="p-1 mt-0.5 hover:bg-[#000150]/10 rounded transition-colors"
            title="Сортировать по алфавиту"
          >
            <SortIcon direction={teamSort} />
          </button>
        </div>
        
        {/* Проект + фильтр */}
        <div className="flex items-center gap-2 relative" ref={projectFilterRef}>
          <span className="text-[20px] font-semibold text-[#000150]">Проект</span>
          <div className="relative">
            <button 
              onClick={() => {
                setIsProjectFilterOpen(!isProjectFilterOpen);
                setIsStatusFilterOpen(false);
              }}
              className={`p-1.5 mt-0.5 rounded-lg transition-colors ${
                selectedProjectId 
                  ? 'bg-[#000150]/10 text-[#000150]' 
                  : 'hover:bg-[#000150]/10 text-gray-400'
              }`}
              title="Фильтр по проекту"
            >
              <FilterIcon isActive={!!selectedProjectId} />
            </button>
            
            {/* Dropdown списка проектов */}
            {isProjectFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto">
                <div className="p-2">
                  {projectFilterOptions.length === 0 ? (
                <div className="py-3 text-center text-sm text-gray-500">Проектов нет</div>
                ) : (
                <>
                    {selectedProjectId && (
                    <button
                        onClick={clearProjectFilter}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mb-1"
                    >
                        ✕ Сбросить фильтр
                    </button>
                    )}
                    {projectFilterOptions.map((project) => (
                    <button
                        key={project.id}
                        onClick={() => handleProjectSelect(project.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedProjectId === project.id
                            ? 'bg-[#000150]/10 text-[#000150] font-medium'
                            : 'hover:bg-[#000150]/10 text-[#000150]/60'
                        }`}
                    >
                        {project.name}
                    </button>
                    ))}
                </>
                )}
                </div>
              </div>
            )}
          </div>
          
          {/* Бейдж выбранного проекта */}
            {selectedProjectId && (
            <span className="text-[16px] px-2 py-0.5 mt-0.5 bg-[#000150]/5 text-[#000150] rounded-2xl">
                {projectFilterOptions.find(p => p.id === selectedProjectId)?.name || 'Выбран'}
            </span>
            )}
        </div>
        
        {/* Статус + фильтр */}
        <div className="flex items-center justify-end gap-2 relative" ref={statusFilterRef}>
          <span className="text-[20px] font-semibold text-[#000150]">Статус</span>
          <div className="relative">
            <button 
              onClick={() => {
                setIsStatusFilterOpen(!isStatusFilterOpen);
                setIsProjectFilterOpen(false);
              }}
              className={`p-1.5 mt-0.5 rounded-lg transition-colors ${
                statusFilter !== 'ALL'
                  ? 'bg-[#000150]/10 text-[#000150]' 
                  : 'hover:bg-[#000150]/5 text-gray-500'
              }`}
              title="Фильтр по статусу"
            >
              <FilterIcon isActive={statusFilter !== 'ALL'} />
            </button>
            
            {/* Dropdown списка статусов */}
            {isStatusFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20">
                <div className="p-1">
                  {[
                    { value: 'ALL' as const, label: 'Все' },
                    { value: 'SEEN' as const, label: 'Просмотрена' },
                    { value: 'UNSEEN' as const, label: 'Не просмотрена' },
                    { value: 'ACCEPTED' as const, label: 'Приняты' },
                    { value: 'DECLINED' as const, label: 'Отказано' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusSelect(option.value)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        statusFilter === option.value
                          ? 'bg-[#000150]/5 text-[#000150] font-medium'
                          : 'hover:bg-gray-50 text-[#000150]/80'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Список заявок */}
      <div className="flex flex-col gap-3">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 text-[#000150]/60">
            {(statusFilter !== 'ALL' || selectedProjectId) 
              ? 'По выбранным фильтрам заявок не найдено' 
              : 'Заявок не найдено'}
          </div>
        ) : (
          filteredApplications.map((app) => (
            <ApplicationRow 
              key={app.id}
              application={app}
              isExpanded={expandedId === app.id}
              onToggleExpand={() => toggleExpand(app.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Компонент переключателя вкладок
function TabSwitcher({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: TabType; 
  onTabChange: (tab: TabType) => void 
}) {
  return (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit text-[20px]">
      <button
        onClick={() => onTabChange('applications')}
        className={`px-6 py-2 rounded-2xl font-medium transition-all ${
          activeTab === 'applications' 
            ? 'bg-[#000150] text-white shadow-sm' 
            : 'text-[#000150]/60 hover:text-[#000150]'
        }`}
      >
        Заявки
      </button>
      <button
        onClick={() => onTabChange('interviews')}
        className={`px-6 py-2 rounded-2xl font-medium transition-all ${
          activeTab === 'interviews' 
            ? 'bg-[#000150] text-white shadow-sm' 
            : 'text-[#000150]/60 hover:text-[#000150]'
        }`}
      >
        Собеседования
      </button>
    </div>
  );
}

// Иконка сортировки
function SortIcon({ direction }: { direction: SortDirection }) {
  return (
    <svg 
      className={`w-5 h-5 transition-transform ${direction === 'asc' ? 'rotate-180' : ''}`} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// Иконка фильтра (воронка)
function FilterIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg 
      className={`w-5 h-5 ${isActive ? 'text-[#000150]' : 'text-gray-500'}`} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
      />
    </svg>
  );
}

// Строка заявки (с возможностью раскрытия)
function ApplicationRow({ 
  application, 
  isExpanded, 
  onToggleExpand 
}: { 
  application: ProjectApplication; 
  isExpanded: boolean; 
  onToggleExpand: () => void;
}) {
  const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
    SEEN: { label: 'Просмотрена', color: 'bg-blue-100 text-blue-800' },
    UNSEEN: { label: 'Не просмотрена', color: 'bg-yellow-100 text-yellow-800' },
    ACCEPTED: { label: 'Принята', color: 'bg-green-100 text-green-800' },
    DECLINED: { label: 'Отказано', color: 'bg-red-100 text-red-800' },
  };

  const status = statusConfig[application.status];

  return (
    <div className={`shadow-md rounded-xl overflow-hidden transition-all ${isExpanded ? '' : 'bg-white hover:bg-gray-50'}`}>
      {/* Сжатая строка */}
      <button 
        onClick={onToggleExpand}
        className="w-full grid grid-cols-3 gap-4 px-4 py-4 text-left"
      >
        <div className="flex gap-3 items-center">
          <span className="font-semibold text-[#000150] text-[18px]">{application.team_name}</span>
          <div className="flex gap-1 bg-[#000150]/15 px-2 py-0.5 rounded-md">
            <Image src={"/user-round.svg"} alt={"К-во участников"} width={20} height={20}/>
            <span className="text-[18px] text-[#000150]">{application.members.length}</span>
          </div>
        </div>
        <div className="text-[#000150] text-[18px] font-medium truncate mt-1.5">
          {application.project?.name || 'Проект не загружен'}
        </div>
        <div className="flex justify-end">
          <span className={`px-3 py-1 rounded-xl pt-1.5 text-[16px] font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>
      </button>

      {/* Раскрытая часть */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-4">
          {/* Участники */}
          <div>
            <h4 className="text-[16px] font-semibold text-[#000150] mb-2">Участники команды</h4>
            <ul className="space-y-2">
              {application.members.map((member, idx) => (
                <li key={member.id || idx} className="flex gap-3 text-[15px]">
                  <span className="w-6 h-6 flex items-center justify-center bg-[#000150]/10 rounded-full text-[#000150] text-xs font-medium">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <span className="font-medium text-[#000150]">{member.fullname}</span>
                    <div className="text-[#000150]/60 text-sm">
                      {member.role} • {member.study_group}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Описание заявки */}
          {application.description && (
            <div>
              <h4 className="text-[16px] font-semibold text-[#000150] mb-2">Описание</h4>
              <p className="text-[15px] text-[#000150]/80 leading-relaxed">
                {application.description}
              </p>
            </div>
          )}

          {/* Кнопки действий (заглушки) */}
          <div className="flex gap-3 pt-2 text-[16px]">
            <div className="ml-auto"/>
              <button className="px-4 py-1.5 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors">
                Отказ
              </button>
              <button className="px-4 py-1.5 bg-yellow-100 text-yellow-800 rounded-xl font-medium hover:bg-yellow-200 transition-colors">
                Собеседование
              </button>

            {/* <button className="px-4 py-1.5 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-colors">
              Принять
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
}