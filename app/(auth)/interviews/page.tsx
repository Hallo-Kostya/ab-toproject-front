'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ProjectApplication,
  ApplicationStatus,
  InterviewStatus,
  ProjectApplicationFilters,
  InterviewFilters,
  Project,
  InterviewUpdatePayload,
} from '@/lib/api/projectApplications';
import {
  getProjectApplications,
  getInterviews,
  changeApplicationStatus,
  updateInterview,
} from '@/lib/api/projectApplications';
import { getProjects } from '@/lib/api/projects';
import Image from 'next/image';
import InterviewArtifacts from '@/components/artifacts/interviewArtifacts';

type TabType = 'applications' | 'interviews';
type SortDirection = 'asc' | 'desc' | null;
type ProjectFilterOption = {
  id: string;
  name: string;
};

const APPLICATION_STATUS_OPTIONS: {
  value: ApplicationStatus | 'ALL';
  label: string;
}[] = [
  { value: 'ALL', label: 'Все' },
  { value: 'UNSEEN', label: 'Не просмотрена' },
  { value: 'INTERVIEW', label: 'Собеседование' },
  { value: 'WAITING_FOR_ACK', label: 'Ждёт решения' },
  { value: 'ACCEPTED', label: 'Принята' },
  { value: 'DECLINED', label: 'Отказано' },
];

const INTERVIEW_STATUS_OPTIONS: {
  value: InterviewStatus;
  label: string;
}[] = [
  { value: 'NEW', label: 'Новое' },
  { value: 'WAITING', label: 'Ожидание' },
  { value: 'RATING', label: 'Оценивается' },
  { value: 'RATED', label: 'Оценено' },
  { value: 'CANCELED', label: 'Отменено' },
];

export default function InterviewsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('applications');

  return (
    <div className="min-h-screen flex flex-col gap-6">
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'applications' ? <ApplicationsTab /> : <InterviewsTab />}
    </div>
  );
}

/* =========================================================
 ВКЛАДКА «ЗАЯВКИ»
 ========================================================= */
function ApplicationsTab() {
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projectFilterOptions, setProjectFilterOptions] = useState<
    ProjectFilterOption[]
  >([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const [teamSort, setTeamSort] = useState<SortDirection>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [isProjectFilterOpen, setIsProjectFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  const projectFilterRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProjectFilterOpen || projectFilterOptions.length > 0) return;
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        const response = await getProjects();
        setProjectFilterOptions(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (response as any).projects
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? (response as any).projects.map((p: Project) => ({ id: p.id, name: p.name }))
            : (response as unknown as Project[]).map((p) => ({ id: p.id, name: p.name }))
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Failed to load projects for filter:', err);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, [isProjectFilterOpen, projectFilterOptions.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        projectFilterRef.current &&
        !projectFilterRef.current.contains(event.target as Node)
      ) {
        setIsProjectFilterOpen(false);
      }
      if (
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target as Node)
      ) {
        setIsStatusFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadApplications = useCallback(async () => {
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
  }, [statusFilter, selectedProjectId]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const toggleSort = () => {
    setTeamSort((prev) =>
      prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
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

  const handleActionComplete = async (
    applicationId: string,
    newStatus: ApplicationStatus
  ) => {
    try {
      await changeApplicationStatus(applicationId, newStatus);
      await loadApplications();
    } catch (err) {
      console.error('Status change error:', err);
      alert('Не удалось изменить статус. Попробуйте ещё раз.');
    }
  };

  const filteredApplications = [...applications].sort((a, b) => {
    if (!teamSort) return 0;
    const nameA = a.team_name.toLowerCase();
    const nameB = b.team_name.toLowerCase();
    if (nameA < nameB) return teamSort === 'asc' ? -1 : 1;
    if (nameA > nameB) return teamSort === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) {
    return (
      <div className="space-y-4 px-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
    );
  }

  return (
    <>
      <div className="flex justify-between gap-4 px-4 py-3 rounded-xl border-b border-gray-200 shadow-sm">
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

            {isProjectFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto">
                <div className="p-2">
                  {projectsLoading ? (
                    <div className="py-3 text-center text-sm text-gray-500">
                      Загрузка...
                    </div>
                  ) : projectFilterOptions.length === 0 ? (
                    <div className="py-3 text-center text-sm text-gray-500">
                      Проектов нет
                    </div>
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

          {selectedProjectId && (
            <span className="text-[16px] px-2 py-0.5 mt-0.5 bg-[#000150]/5 text-[#000150] rounded-2xl">
              {projectFilterOptions.find((p) => p.id === selectedProjectId)?.name ||
                'Выбран'}
            </span>
          )}
        </div>

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

            {isStatusFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-20">
                <div className="p-1">
                  {APPLICATION_STATUS_OPTIONS.map((option) => (
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

      <div className="flex flex-col gap-3">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 text-[#000150]/60">
            {statusFilter !== 'ALL' || selectedProjectId
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
              onChangeStatus={handleActionComplete}
            />
          ))
        )}
      </div>
    </>
  );
}

/* =========================================================
 ВКЛАДКА «СОБЕСЕДОВАНИЯ»
 ========================================================= */
function InterviewsTab() {
  const [interviews, setInterviews] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projectFilterOptions, setProjectFilterOptions] = useState<
    ProjectFilterOption[]
  >([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const [teamSort, setTeamSort] = useState<SortDirection>(null);
  const [dateSort, setDateSort] = useState<SortDirection>('asc');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<InterviewStatus[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [isProjectFilterOpen, setIsProjectFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  const projectFilterRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProjectFilterOpen || projectFilterOptions.length > 0) return;
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        const response = await getProjects();
        setProjectFilterOptions(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (response as any).projects
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? (response as any).projects.map((p: Project) => ({ id: p.id, name: p.name }))
            : (response as unknown as Project[]).map((p) => ({ id: p.id, name: p.name }))
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Failed to load projects for filter:', err);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, [isProjectFilterOpen, projectFilterOptions.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        projectFilterRef.current &&
        !projectFilterRef.current.contains(event.target as Node)
      ) {
        setIsProjectFilterOpen(false);
      }
      if (
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target as Node)
      ) {
        setIsStatusFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadInterviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: InterviewFilters = {
        project_id: selectedProjectId || undefined,
        interview_status:
          selectedStatuses.length > 0 ? selectedStatuses : undefined,
      };
      const data = await getInterviews(filters);
      setInterviews(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки собеседований');
      console.error('Interviews fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId, selectedStatuses]);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  const toggleTeamSort = () =>
    setTeamSort((prev) =>
      prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
    );
  const toggleDateSort = () =>
    setDateSort((prev) =>
      prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
    );

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsProjectFilterOpen(false);
  };

  const clearProjectFilter = () => setSelectedProjectId(null);

  const toggleStatusFilter = (status: InterviewStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const clearStatusFilter = () => setSelectedStatuses([]);

  const sortedInterviews = [...interviews].sort((a, b) => {
    if (dateSort) {
      const dateA = a.interview?.date ? new Date(a.interview.date).getTime() : 0;
      const dateB = b.interview?.date ? new Date(b.interview.date).getTime() : 0;
      if (dateA !== dateB) return dateSort === 'asc' ? dateA - dateB : dateB - dateA;
    }
    if (teamSort) {
      const nameA = a.team_name.toLowerCase();
      const nameB = b.team_name.toLowerCase();
      if (nameA < nameB) return teamSort === 'asc' ? -1 : 1;
      if (nameA > nameB) return teamSort === 'asc' ? 1 : -1;
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="space-y-4 px-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-6 gap-4 px-4 py-3 rounded-xl border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[20px] font-semibold text-[#000150]">Команда</span>
          <button
            onClick={toggleTeamSort}
            className="p-1 mt-0.5 hover:bg-[#000150]/10 rounded transition-colors"
            title="Сортировать по алфавиту"
          >
            <SortIcon direction={teamSort} />
          </button>
        </div>

        <div className="flex items-center col-span-3 gap-2 relative" ref={projectFilterRef}>
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

            {isProjectFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto">
                <div className="p-2">
                  {projectsLoading ? (
                    <div className="py-3 text-center text-sm text-gray-500">
                      Загрузка...
                    </div>
                  ) : projectFilterOptions.length === 0 ? (
                    <div className="py-3 text-center text-sm text-gray-500">
                      Проектов нет
                    </div>
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

          {selectedProjectId && (
            <span className="text-[16px] px-2 py-0.5 mt-0.5 bg-[#000150]/5 text-[#000150] rounded-2xl truncate max-w-lg">
              {projectFilterOptions.find((p) => p.id === selectedProjectId)?.name ||
                'Выбран'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[20px] font-semibold text-[#000150]">Дата</span>
          <button
            onClick={toggleDateSort}
            className="p-1 mt-0.5 hover:bg-[#000150]/10 rounded transition-colors"
            title="Сортировать по дате"
          >
            <SortIcon direction={dateSort} />
          </button>
        </div>

        <div
          className="flex items-center justify-end gap-2 relative"
          ref={statusFilterRef}
        >
          <span className="text-[20px] font-semibold text-[#000150]">Статус</span>
          <div className="relative">
            <button
              onClick={() => {
                setIsStatusFilterOpen(!isStatusFilterOpen);
                setIsProjectFilterOpen(false);
              }}
              className={`p-1.5 mt-0.5 rounded-lg transition-colors ${
                selectedStatuses.length > 0
                  ? 'bg-[#000150]/10 text-[#000150]'
                  : 'hover:bg-[#000150]/5 text-gray-500'
              }`}
              title="Фильтр по статусу собеседования"
            >
              <FilterIcon isActive={selectedStatuses.length > 0} />
            </button>

            {isStatusFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-20">
                <div className="p-1">
                  {selectedStatuses.length > 0 && (
                    <button
                      onClick={clearStatusFilter}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mb-1"
                    >
                      ✕ Сбросить фильтры
                    </button>
                  )}
                  {INTERVIEW_STATUS_OPTIONS.map((option) => {
                    const value = option.value;
                    const isSelected = selectedStatuses.includes(value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => toggleStatusFilter(value)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-[#000150]/5 text-[#000150] font-medium'
                            : 'hover:bg-gray-50 text-[#000150]/80'
                        }`}
                      >
                        <span>{option.label}</span>
                        {isSelected && <span className="text-[#000150]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {sortedInterviews.length === 0 ? (
          <div className="text-center py-12 text-[#000150]/60">
            {selectedStatuses.length > 0 || selectedProjectId
              ? 'По выбранным фильтрам собеседований не найдено'
              : 'Собеседований не найдено'}
          </div>
        ) : (
          sortedInterviews.map((app) => (
            <InterviewRow
              key={app.id}
              application={app}
              isExpanded={expandedId === app.id}
              onToggleExpand={() => toggleExpand(app.id)}
              onRefresh={loadInterviews}
            />
          ))
        )}
      </div>
    </>
  );
}

/* =========================================================
 ОБЩИЕ КОМПОНЕНТЫ
 ========================================================= */
function TabSwitcher({
  activeTab,
  onTabChange,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
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

function SortIcon({ direction }: { direction: SortDirection }) {
  return (
    <svg
      className={`w-5 h-5 transition-transform ${
        direction === 'asc' ? 'rotate-180' : ''
      } ${direction ? 'text-[#000150]' : 'text-gray-400'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

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

/* =========================================================
 СТРОКА ЗАЯВКИ
 ========================================================= */
function ApplicationRow({
  application,
  isExpanded,
  onToggleExpand,
  onChangeStatus,
}: {
  application: ProjectApplication;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onChangeStatus: (id: string, status: ApplicationStatus) => Promise<void>;
}) {
  const [actionLoading, setActionLoading] = useState<ApplicationStatus | null>(null);

  const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
    UNSEEN: { label: 'Не просмотрена', color: 'bg-yellow-100 text-yellow-800' },
    INTERVIEW: { label: 'Собеседование', color: 'bg-purple-100 text-purple-800' },
    WAITING_FOR_ACK: {
      label: 'Ожидает решения',
      color: 'bg-indigo-100 text-indigo-800',
    },
    ACCEPTED: { label: 'Принята', color: 'bg-green-100 text-green-800' },
    DECLINED: { label: 'Отказано', color: 'bg-red-100 text-red-800' },
  };

  const status = statusConfig[application.status];

  const handleAction = async (newStatus: ApplicationStatus) => {
    setActionLoading(newStatus);
    await onChangeStatus(application.id, newStatus);
    setActionLoading(null);
  };

  const canAccept =
    application.status === 'UNSEEN' || application.status === 'INTERVIEW' || application.status === 'WAITING_FOR_ACK';
  const canInterview =
    application.status === 'UNSEEN';
  const canDecline =
    application.status !== 'DECLINED' && application.status !== 'ACCEPTED';

  return (
    <div
      className={`shadow-md rounded-xl overflow-hidden transition-all ${
        isExpanded ? 'bg-white' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <button onClick={onToggleExpand} className="w-full grid grid-cols-6 gap-4 px-4 py-4 text-left">
        <div className="flex gap-3 items-center">
          <span className="font-semibold text-[#000150] text-[18px]">
            {application.team_name}
          </span>
          <div className="flex gap-1 bg-[#000150]/15 px-2 py-0.5 rounded-md min-w-12.5">
            <Image
              src={'/user-round.svg'}
              alt={'Количество участников'}
              width={20}
              height={20}
            />
            <span className="text-[18px] text-[#000150]">
              {application.members.length}
            </span>
          </div>
        </div>
        <div className="col-start-3 col-span-3 text-[#000150] text-[18px] font-medium mt-1.5">
          {application.project?.name || 'Проект не загружен'}
        </div>
        <div className="flex items-center text-center justify-end">
          <span
            className={`px-3 py-1 rounded-xl pt-1.5 text-[16px] font-medium ${status.color}`}
          >
            {status.label}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-4">
          <div>
            <h4 className="text-[16px] font-semibold text-[#000150] mb-2">
              Участники команды
            </h4>
            <ul className="space-y-2">
              {application.members.map((member, idx) => (
                <li key={member.id || idx} className="flex gap-3 text-[15px]">
                  <span className="w-6 h-6 flex items-center justify-center bg-[#000150]/10 rounded-full text-[#000150] text-xs font-medium">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <span className="font-medium text-[#000150]">
                      {member.fullname}
                    </span>
                    <div className="text-[#000150]/60 text-sm">
                      {member.role} • {member.study_group}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {application.description && (
            <div>
              <h4 className="text-[16px] font-semibold text-[#000150] mb-2">
                Описание
              </h4>
              <p className="text-[15px] text-[#000150]/80 leading-relaxed">
                {application.description}
              </p>
            </div>
          )}

          {application.interview && (
            <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-100">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h4 className="text-[15px] font-semibold text-[#000150]">
                    Запланировано собеседование
                  </h4>
                  <div className="text-[14px] text-[#000150]/70 mt-1">
                    {formatDateTime(application.interview.date)}
                  </div>
                  {application.interview.url && (
                    <a
                      href={application.interview.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[14px] text-purple-700 underline break-all"
                    >
                      {application.interview.url}
                    </a>
                  )}
                </div>
                <InterviewStatusBadge status={application.interview.interview_status} />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2 text-[16px]">
            <div className="ml-auto flex gap-3">
              {canDecline && (
                <button
                  onClick={() => handleAction('DECLINED')}
                  disabled={actionLoading !== null}
                  className="px-4 py-1.5 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'DECLINED' ? '...' : 'Отказ'}
                </button>
              )}
              {canInterview && (
                <button
                  onClick={() => handleAction('INTERVIEW')}
                  disabled={actionLoading !== null}
                  className="px-4 py-1.5 bg-yellow-100 text-yellow-800 rounded-xl font-medium hover:bg-yellow-200 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'INTERVIEW' ? '...' : 'Собеседование'}
                </button>
              )}
              {canAccept && (
                <button
                  onClick={() => handleAction('ACCEPTED')}
                  disabled={actionLoading !== null}
                  className="px-4 py-1.5 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'ACCEPTED' ? '...' : 'Принять'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
 СТРОКА СОБЕСЕДОВАНИЯ
 ========================================================= */
function InterviewRow({
  application,
  isExpanded,
  onToggleExpand,
  onRefresh,
}: {
  application: ProjectApplication;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRefresh: () => Promise<void>;
}) {
  const interview = application.interview;
  const [isEditing, setIsEditing] = useState(false);

  if (!interview) return null;

  return (
    <div
      className={`shadow-md rounded-xl overflow-hidden transition-all ${
        isExpanded ? 'bg-white' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <button
        onClick={onToggleExpand}
        className="w-full grid grid-cols-6 gap-4 px-4 py-4 text-left"
      >
        <div className="flex gap-3 items-center">
          <span className="font-semibold text-[#000150] text-[18px]">
            {application.team_name}
          </span>
          <div className="flex gap-1 bg-[#000150]/15 px-2 py-0.5 rounded-md min-w-12.5">
            <Image
              src={'/user-round.svg'}
              alt={'Количество участников'}
              width={20}
              height={20}
            />
            <span className="text-[18px] text-[#000150]">
              {application.members.length}
            </span>
          </div>
        </div>
        <div className="flex items-center col-span-2 text-[#000150] text-[18px] font-medium truncate">
          {application.project?.name || 'Проект не загружен'}
        </div>
        <div className="col-start-5 text-[#000150]/80 text-[16px] font-medium mt-1.5">
          {formatDateTime(interview.date)}
        </div>
        <div className="flex justify-end items-center">
          <InterviewStatusBadge status={interview.interview_status} />
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-4">
          {isEditing ? (
            <InterviewEditForm
              interview={interview}
              onCancel={async () => {
                setIsEditing(false);
                // При закрытии формы обновляем карточку, чтобы отобразить сохранённые изменения
                await onRefresh();
              }}
              onSaved={async () => {
                setIsEditing(false);
                await onRefresh();
              }}
            />
          ) : (
            <>
              <div className="bg-purple-50/40 rounded-lg p-3 border border-purple-100 space-y-2">
                <h4 className="text-[16px] font-semibold text-[#000150]">
                  Детали собеседования
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[15px]">
                  <InfoLine label="Дата" value={formatDateTime(interview.date)} />
                  <InfoLine
                    label="Оценка куратора"
                    value={
                      interview.curators_rate !== null &&
                      interview.curators_rate !== undefined
                        ? `${interview.curators_rate} / 100`
                        : '—'
                    }
                  />
                  <InfoLine
                    label="Ссылка на встречу"
                    value={
                      interview.url ? (
                        <a
                          href={interview.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-700 underline break-all"
                        >
                          {interview.url}
                        </a>
                      ) : (
                        '—'
                      )
                    }
                  />
                  <InfoLine
                    label="Средний балл команды"
                    value={application.mean_project_score.toFixed(2)}
                  />
                </div>
                {interview.resume && (
                  <div className="pt-2">
                    <div className="text-[14px] font-semibold text-[#000150]/80 mb-1">
                      Резюме
                    </div>
                    <p className="text-[15px] text-[#000150]/80 leading-relaxed whitespace-pre-wrap">
                      {interview.resume}
                    </p>
                  </div>
                )}
              </div>

              {/* Артефакты собеседования — берём из уже загруженных данных */}
              <InterviewArtifacts
                interviewId={interview.id}
                artifacts={interview.artifacts ?? []}
                onArtifactsChange={onRefresh}
              />

              <div>
                <h4 className="text-[16px] font-semibold text-[#000150] mb-2">
                  Участники команды
                </h4>
                <ul className="space-y-2">
                  {application.members.map((member, idx) => (
                    <li key={member.id || idx} className="flex gap-3 text-[15px]">
                      <span className="w-6 h-6 flex items-center justify-center bg-[#000150]/10 rounded-full text-[#000150] text-xs font-medium">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <span className="font-medium text-[#000150]">
                          {member.fullname}
                        </span>
                        <div className="text-[#000150]/60 text-sm">
                          {member.role} • {member.study_group}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {application.description && (
                <div>
                  <h4 className="text-[16px] font-semibold text-[#000150] mb-2">
                    Описание заявки
                  </h4>
                  <p className="text-[15px] text-[#000150]/80 leading-relaxed">
                    {application.description}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2 text-[16px]">
                <div className="ml-auto">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-1.5 bg-[#000150] text-white rounded-xl font-medium hover:bg-[#000150]/90 transition-colors"
                  >
                    Редактировать
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
 ФОРМА РЕДАКТИРОВАНИЯ СОБЕСЕДОВАНИЯ
 ========================================================= */
function InterviewEditForm({
  interview,
  onCancel,
  onSaved,
}: {
  interview: NonNullable<ProjectApplication['interview']>;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  // Используем состояния для URL, чтобы отслеживать "последний сохранённый" URL
  // и не считать его изменённым при повторных нажатиях "Сохранить"
  const [currentUrl, setCurrentUrl] = useState(interview.url || '');
  const [savedUrl, setSavedUrl] = useState(interview.url || '');
  const [curatorsRate, setCuratorsRate] = useState<string>(
    interview.curators_rate !== null && interview.curators_rate !== undefined
      ? String(interview.curators_rate)
      : ''
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Поле оценки разблокировано, если у собеседования уже есть сохранённая ссылка
  const [isRateUnlocked, setIsRateUnlocked] = useState(!!interview.url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const rateNumber = curatorsRate.trim() === '' ? undefined : Number(curatorsRate);
    if (rateNumber !== undefined && (isNaN(rateNumber) || rateNumber < 0 || rateNumber > 100)) {
      setError('Оценка должна быть числом от 0 до 100');
      return;
    }

    if (!isRateUnlocked && curatorsRate.trim() !== '') {
      setError('Сначала сохраните ссылку на встречу, чтобы выставить оценку');
      return;
    }

    if (currentUrl.trim() !== '') {
      try {
        new URL(currentUrl.trim());
      } catch {
        setError('Введите корректную ссылку (например, https://...)');
        return;
      }
    }

    const payload: InterviewUpdatePayload = {};
    let urlChanged = false;

    // Отправляем ссылку, если она изменилась относительно ПОСЛЕДНЕГО СОХРАНЁННОГО URL
    if (currentUrl.trim() !== savedUrl) {
      payload.url = currentUrl.trim();
      urlChanged = true;
    }

    const prevRate =
      interview.curators_rate !== null && interview.curators_rate !== undefined
        ? interview.curators_rate
        : null;
    const nextRate = rateNumber !== undefined ? rateNumber : null;

    // Отправляем оценку только если поле разблокировано и значение изменилось
    if (isRateUnlocked && nextRate !== prevRate) {
      payload.curators_rate = rateNumber;
    }

    if (Object.keys(payload).length === 0) {
      onCancel();
      return;
    }

    try {
      setSaving(true);
      await updateInterview(interview.id, payload);

      // Если ссылка была сохранена — обновляем "последний сохранённый URL",
      // разблокируем поле оценки и показываем сообщение.
      // Форму НЕ закрываем, чтобы можно было сразу ввести оценку.
      if (urlChanged) {
        setSavedUrl(currentUrl.trim());
        setIsRateUnlocked(true);
        setSuccessMessage('Ссылка сохранена. Теперь вы можете указать оценку куратора.');
      }

      // Если была сохранена оценка — закрываем форму и обновляем данные
      if (payload.curators_rate !== undefined) {
        await onSaved();
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-purple-50/40 rounded-lg p-4 border border-purple-100 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-[16px] font-semibold text-[#000150]">
          Редактирование собеседования
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-[#000150]/60 hover:text-[#000150] transition-colors"
          title="Отмена"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-[14px] text-[#000150]/80 font-medium">
            Ссылка на онлайн-встречу
          </span>
          <input
            type="text"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            placeholder="https://..."
            className="px-3 py-2 border border-gray-200 rounded-lg text-[15px] focus:outline-none focus:border-[#000150]/40 focus:ring-2 focus:ring-[#000150]/10"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[14px] text-[#000150]/80 font-medium flex items-center gap-1.5">
            Оценка куратора (0–100)
            {!isRateUnlocked && (
              <span
                className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md font-normal"
                title="Поле станет доступным после сохранения ссылки на встречу"
              >
                Сначала сохраните ссылку
              </span>
            )}
          </span>
          <input
            type="number"
            min={0}
            max={100}
            step={5}
            value={curatorsRate}
            onChange={(e) => setCuratorsRate(e.target.value)}
            placeholder={isRateUnlocked ? '—' : 'Сначала сохраните ссылку'}
            disabled={!isRateUnlocked}
            className={`px-3 py-2 border border-gray-200 rounded-lg text-[15px] focus:outline-none focus:border-[#000150]/40 focus:ring-2 focus:ring-[#000150]/10 ${
              !isRateUnlocked
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : ''
            }`}
          />
        </label>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          {successMessage}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-1.5 bg-gray-100 text-[#000150]/80 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-1.5 bg-[#000150] text-white rounded-xl font-medium hover:bg-[#000150]/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
}

function InfoLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-[13px] text-[#000150]/60">{label}</span>
      <span className="text-[15px] text-[#000150] font-medium">{value}</span>
    </div>
  );
}

function InterviewStatusBadge({ status }: { status: InterviewStatus }) {
  const config: Record<InterviewStatus, { label: string; color: string }> = {
    NEW: { label: 'Новое', color: 'bg-blue-100 text-blue-800' },
    WAITING: { label: 'Ожидание', color: 'bg-amber-100 text-amber-800' },
    RATING: { label: 'Оценивается', color: 'bg-purple-100 text-purple-800' },
    RATED: { label: 'Оценено', color: 'bg-green-100 text-green-800' },
    CANCELED: { label: 'Отменено', color: 'bg-red-100 text-red-800' },
  };
  const c = config[status];
  return (
    <span className={`px-3 py-1 rounded-xl pt-1.5 text-[16px] font-medium ${c.color}`}>
      {c.label}
    </span>
  );
}

// Форматирование даты: бэкенд хранит время как "наивное" (без учёта TZ),
// но отдаёт с суффиксом Z (UTC). Чтобы время отображалось "как установлено"
// (10:00 → 10:00, а не 15:00 в UTC+5), используем timeZone: 'UTC'.
function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });
  } catch {
    return iso;
  }
}