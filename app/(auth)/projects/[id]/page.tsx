'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Project, getProjectById, getProjectTeams } from "@/lib/api/projects";
import { TeamSummary } from "@/lib/api/teams";
import { useAuth } from "@/context/AuthContext";
import { useParams } from 'next/navigation';
import DeleteProjectModal from '@/components/ui/deleteProjectModal';
import EditProjectForm from '@/components/forms/editProjectForm';
import AssignTeamToProjectModal from '@/components/ui/assignTeamToProjectModal';
import ProjectTeamCard from '@/components/ui/cards/projectTeamCard';
import { 
  Artifact, 
  getArtifacts, 
  uploadProjectArtifact, 
  detachArtifact, 
  formatFileSize, 
  getFileIconType,
  FileIconType, 
  downloadArtifact,
  getArtifactDownloadUrl,
  addMeetingLinkArtifact
} from "@/lib/api/artifacts";

// ─────────────────────────────────────────────
// Модальные окна для артефактов
// ─────────────────────────────────────────────

interface AddLinkArtifactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (linkUrl: string, name?: string) => Promise<void>;
  isLoading?: boolean;
}

function AddLinkArtifactModal({ isOpen, onClose, onConfirm, isLoading }: AddLinkArtifactModalProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    await onConfirm(linkUrl.trim(), name.trim() || undefined);
    setLinkUrl('');
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#000150]/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-[#000150]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#000150]">Добавить ссылку</h3>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com/document"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000150] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название (опционально)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Описание ссылки"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000150] focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 py-2.5 px-4 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            disabled={isLoading}
          >
            Отмена
          </button>
          <button 
            type="submit" 
            className="flex-1 py-2.5 px-4 bg-[#000150] text-white rounded-xl font-medium hover:bg-blue-900 transition-colors disabled:opacity-50"
            disabled={isLoading || !linkUrl.trim()}
          >
            {isLoading ? 'Добавление...' : 'Добавить'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────
// Компонент иконки файла (ЛОКАЛЬНЫЙ, рендерит JSX)
// ─────────────────────────────────────────────

function FileIcon({ type }: { type: Exclude<FileIconType, 'link'> }) {
  const icons = {
    pdf: (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    doc: (
      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    excel: (
      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    image: (
      <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    file: (
      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  };
  return icons[type];
}

// ─────────────────────────────────────────────
// Компонент карточки артефакта
// ─────────────────────────────────────────────

interface ArtifactCardProps {
  artifact: Artifact;
  projectId: string;
  onDetach: (artifactId: string) => void;
  isDetaching?: boolean;
}

function ArtifactCard({ artifact, onDetach, isDetaching }: ArtifactCardProps) {
  const iconType = getFileIconType(artifact);
  const isLink = artifact.type === 'LINK' || (!!artifact.link_url && !artifact.s3_key);
  const downloadUrl = getArtifactDownloadUrl(artifact);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    
    if (isLink && artifact.link_url) {
      e.preventDefault();
      window.open(artifact.link_url, '_blank', 'noopener,noreferrer');
    } else if (downloadUrl) {
      e.preventDefault();
      downloadArtifact(downloadUrl, artifact.name);
    }
  };

  return (
    <li 
      className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-3">
        {/* Иконка файла или ссылки */}
        <div className="shrink-0 p-2 bg-gray-100 rounded-lg">
          {iconType === 'link' ? (
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          ) : (
            <FileIcon type={iconType as Exclude<FileIconType, 'link'>} />
          )}
        </div>
        
        {/* Информация */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[#000150] truncate" title={artifact.name}>
            {artifact.name}
          </h4>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
            {artifact.file_size && !isLink && <span>{formatFileSize(artifact.file_size)}</span>}
            {/* {artifact.content_type && !isLink && <span className="uppercase">{artifact.content_type.split('/')[1] || artifact.content_type}</span>} */}
            {artifact.created_at && <span>{new Date(artifact.created_at).toLocaleDateString('ru-RU')}</span>}
          </div>
          
          {/* Подсказка действия */}
          {/* <span className={`inline-flex items-center gap-1 text-sm mt-2 ${isLink ? 'text-blue-600' : 'text-[#000150]/70'}`}>
            {isLink ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Открыть ссылку
              </>
            ) : null}
          </span> */}
        </div>
        
        {/* Кнопка удаления */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDetach(artifact.id);
          }}
          disabled={isDetaching}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Удалить артефакт из проекта"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────
// Вспомогательный компонент секции
// ─────────────────────────────────────────────

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="border-b border-gray-300/40 pb-4.5">
      <h2 className="text-[24px] text-[#000150] font-medium mb-3">{title}</h2>
      <p className="text-[22px] leading-relaxed whitespace-pre-wrap">{content || 'Не указано'}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Основной компонент страницы
// ─────────────────────────────────────────────

export default function ProjectPage() {
  const params = useParams();
  const { id } = params as { id: string };
  
  const [project, setProject] = useState<Project | null>(null);
  const [projectTeams, setProjectTeams] = useState<TeamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  
  // Состояние для артефактов проекта
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [artifactsLoading, setArtifactsLoading] = useState(false);
  const [artifactsError, setArtifactsError] = useState<string | null>(null);
  const [detachingArtifactId, setDetachingArtifactId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignTeamModalOpen, setIsAssignTeamModalOpen] = useState(false);
  
  const { isAuthenticated, user } = useAuth();

  // Загрузка артефактов проекта
  const fetchArtifacts = useCallback(async () => {
    try {
      setArtifactsLoading(true);
      setArtifactsError(null);
      const artifactsData = await getArtifacts({ project_id: id });
      setArtifacts(artifactsData);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.warn('Failed to load artifacts (soft failure):', err);
      setArtifactsError('Не удалось загрузить артефакты');
      setArtifacts([]);
    } finally {
      setArtifactsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        const projectData = await getProjectById(id);
        setProject(projectData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки данных проекта');
        console.error('Project fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchProjectTeamsData = async () => {
      try {
        setTeamsLoading(true);
        setTeamsError(null);
        
        const teamsData = await getProjectTeams(id, {
          project_team_status: 'ACTIVE'
        });
        
        setProjectTeams(teamsData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.warn('Failed to load project teams (soft failure):', err);
        setTeamsError('Не удалось загрузить команды проекта');
        setProjectTeams([]);
      } finally {
        setTeamsLoading(false);
      }
    };

    fetchProjectData();
    fetchProjectTeamsData();
    
  }, [isAuthenticated, id]);

  // Загрузка артефактов после загрузки проекта
  useEffect(() => {
    if (project?.id) {
      fetchArtifacts();
    }
  }, [project, fetchArtifacts]);

  const handleTeamAssigned = async () => {
    try {
      const teamsData = await getProjectTeams(id, {
        project_team_status: 'ACTIVE'
      });
      setProjectTeams(teamsData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.warn('Failed to refresh project teams:', err);
      setTeamsError('Ошибка обновления списка команд');
    }
  };

  const handleTeamRemoved = async () => {
    try {
      const teamsData = await getProjectTeams(id, {
        project_team_status: 'ACTIVE'
      });
      setProjectTeams(teamsData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.warn('Failed to refresh project teams after removal:', err);
      setTeamsError('Ошибка обновления списка команд');
    }
  };

  // Загрузка файла-артефакта для проекта
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;

    try {
      setArtifactsLoading(true);
      setArtifactsError(null);
      await uploadProjectArtifact(project.id, file);
      await fetchArtifacts();
      if (fileInputRef.current) fileInputRef.current.value = '';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Artifact upload error:', err);
      setArtifactsError(err.message || 'Ошибка при загрузке файла');
    } finally {
      setArtifactsLoading(false);
    }
  };

  // Добавление ссылки-артефакта для проекта
  const handleAddLinkArtifact = async (linkUrl: string, name?: string) => {
    if (!project) return;
    try {
      setArtifactsLoading(true);
      setArtifactsError(null);
      // Требуется поддержка JSON-запросов на бэкенде для project-эндпоинта
      await addMeetingLinkArtifact(project.id, linkUrl, name);
      await fetchArtifacts();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Link artifact error:', err);
      setArtifactsError(err.message || 'Ошибка при добавлении ссылки');
    } finally {
      setArtifactsLoading(false);
    }
  };

  // Открепление артефакта от проекта
  const handleDetachArtifact = async (artifactId: string) => {
    if (!project) return;
    try {
      setDetachingArtifactId(artifactId);
      await detachArtifact(artifactId, 'PROJECT', project.id);
      await fetchArtifacts();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Artifact detach error:', err);
      setArtifactsError(err.message || 'Ошибка при удалении артефакта');
    } finally {
      setDetachingArtifactId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col gap-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="space-y-6 mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-7 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className={`h-4 bg-gray-200 rounded animate-pulse ${i % 2 === 0 ? 'w-3/4' : 'w-2/3'}`}></div>
            </div>
          ))}
        </div>
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

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#000150]">Проект не найден</div>
      </div>
    );
  }

  const activeProjectTeams = projectTeams;

  return (
    <>
      <div className="space-y-8">
        <div>
          <div className="mb-3">
            <div className="flex justify-between items-center">
              <h1 className="text-[#000150] text-[26px] font-semibold">{project.name}</h1>
              {isAuthenticated && user && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center ml-auto bg-[#000150]/20 px-4 py-2 rounded-[20px] text-[#000150] text-[19px] font-semibold max-h-11.75 hover:bg-[#000150]/30 transition-colors shadow-md inset-shadow-xl"
                    title="Редактировать проект"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    title="Удалить проект"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <p><span className="text-[24px] text-[#000150] font-medium">{project.year} год, {project.semester === 'AUTUMN' ? 'Осенний' : 'Весенний'} семестр</span></p>
            <div className="px-3 py-px bg-[#E79E00]/20 rounded-lg">
              <span className="text-[#E79E00] text-[20px] font-medium">
                {project.status === 'PLANNED' ? 'Планируется' : 
                 project.status === 'IN_PROGRESS' ? 'В работе' : 'Завершен'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-4.5">
          <Section title={"Описание"} content={project.description || 'Не указано'} />
          <Section title={"Цель"} content={project.goal || 'Не указана'} />
          <Section title={"Требования"} content={project.requirements || 'Не указаны'} />
          <Section title={"Критерии оценки"} content={project.eval_criteria || 'Не указаны'} />
        </div>

        {/* Артефакты проекта */}
        <div className="mt-9">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[24px] text-[#000150] font-medium">Артефакты проекта</h2>
            {isAuthenticated && user && (
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp,.txt,.zip,.rar"
                />
                <div className="flex gap-2">
                  {/* Кнопка загрузки файла */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={artifactsLoading}
                    className="px-4 py-2 bg-[#000150] text-white rounded-[20px] hover:bg-[#000150]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    title="Загрузить файл"
                  >
                    {artifactsLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    Файл
                  </button>
                  
                  {/* Кнопка добавления ссылки */}
                  <button
                    onClick={() => setIsAddLinkModalOpen(true)}
                    disabled={artifactsLoading}
                    className="px-4 py-2 bg-white text-[#000150] border border-[#000150] rounded-[20px] hover:bg-[#000150]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    title="Добавить ссылку"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Ссылка
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center mb-6">
            <p className="text-[18px] text-[#353535]">Артефактов найдено: <span className="text-[18px] text-[#000150] font-semibold">{artifacts.length}</span></p>
          </div>
          
          {artifactsError && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded text-sm">{artifactsError}</div>
          )}
          
          {artifactsLoading && artifacts.length === 0 ? (
            <p className="text-gray-500">Загрузка артефактов...</p>
          ) : artifacts.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {artifacts.map((artifact) => (
                <ArtifactCard
                  key={artifact.id}
                  artifact={artifact}
                  projectId={project.id}
                  onDetach={handleDetachArtifact}
                  isDetaching={detachingArtifactId === artifact.id}
                />
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">
              <p>К этому проекту еще не прикреплены артефакты</p>
              {isAuthenticated && user && (
                <p className="mt-2 text-sm text-[#000150]/70">Нажмите «Файл» или «Ссылка» чтобы добавить артефакт</p>
              )}
            </div>
          )}
        </div>
        
        {/* Блок команд проекта */}
        <div className="mt-9">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[24px] text-[#000150] font-medium">Команды-исполнители</h2>
            {isAuthenticated && user && (
              <button
                onClick={() => setIsAssignTeamModalOpen(true)}
                className="flex gap-2 items-center px-4 py-2 bg-[#000150] text-white rounded-[20px] hover:bg-blue-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Команда
              </button>
            )}
          </div>

          {teamsLoading ? (
            <div className="text-gray-500">Загрузка команд...</div>
          ) : teamsError ? (
            <div className="p-3 bg-yellow-50 text-yellow-800 rounded text-sm">
              {teamsError}
            </div>
          ) : (
            <>
              <div className="flex items-center mb-6">
                <p className="text-[18px] text-[#353535]">
                  Команд найдено: <span className="text-[18px] text-[#000150] font-semibold">{activeProjectTeams.length}</span>
                </p>
              </div>
              
              {activeProjectTeams.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeProjectTeams.map((team) => (
                    <li key={team.id}>
                      <ProjectTeamCard 
                        team={team}
                        projectId={project.id} 
                        onTeamRemoved={handleTeamRemoved} 
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500">
                  <p>К этому проекту еще нет активных команд</p>
                  {isAuthenticated && user && (
                    <p className="mt-2 text-sm">{`Нажмите "+ Команда" чтобы назначить команду на проект`}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Модальные окна */}
      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        projectId={project.id}
        projectName={project.name}
      />
      
      {project && (
        <EditProjectForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          projectId={project.id}
          initialData={project}
        />
      )}
      
      <AssignTeamToProjectModal
        isOpen={isAssignTeamModalOpen}
        onClose={() => setIsAssignTeamModalOpen(false)}
        projectId={project.id}
        onTeamAssigned={handleTeamAssigned}
      />

      {/* Модальное окно добавления ссылки-артефакта */}
      <AddLinkArtifactModal 
        isOpen={isAddLinkModalOpen} 
        onClose={() => setIsAddLinkModalOpen(false)} 
        onConfirm={handleAddLinkArtifact}
        isLoading={artifactsLoading} 
      />
    </>
  );
}