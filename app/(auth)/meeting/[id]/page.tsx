'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Meeting, 
  getMeetingById, 
  deleteMeeting, 
  addTaskToMeeting,
  removeTaskFromMeeting
} from "@/lib/api/meetings";
import { Task, getTasks, moveTaskToNextMeeting, updateTask } from "@/lib/api/tasks";
import { 
  Artifact, 
  getArtifacts, 
  uploadMeetingArtifact, 
  detachArtifact, 
  formatFileSize, 
  getFileIconType,
  FileIconType, 
  downloadArtifact,
  addMeetingLinkArtifact,
  getArtifactDownloadUrl
} from "@/lib/api/artifacts";
import { Team, getTeamById } from "@/lib/api/teams";
import { Student, getTeamStudents } from "@/lib/api/students";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from 'next/navigation';
import EditMeetingForm from '@/components/forms/editMeetingForm';
import DeleteMeetingModal from '@/components/ui/deleteMeetingModal';
import TaskFormModal from '@/components/ui/taskFormModal';
import DeleteTaskModal from '@/components/ui/deleteTaskModal';
import EditTaskModal from '@/components/ui/editTaskModal';

// ─────────────────────────────────────────────
// Модальные окна для задач
// ─────────────────────────────────────────────

interface CompleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onConfirm: () => void;
}

function CompleteTaskModal({ isOpen, onClose, task, onConfirm }: CompleteTaskModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#000150]">Подтвердите выполнение</h3>
        </div>
        <p className="text-[#353535] mb-6">Вы действительно хотите отметить задачу как выполненную?</p>
        <p className="text-[16px] text-gray-600 bg-gray-50 rounded-lg p-3 mb-6">{task.description}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 px-4 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors">Отмена</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-2.5 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">Подтвердить</button>
        </div>
      </div>
    </div>
  );
}

interface TaskMoveSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskDescription: string;
}

function TaskMoveSuccessModal({ isOpen, onClose, taskDescription }: TaskMoveSuccessModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#000150]/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-[#000150]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#000150]">Задача перенесена</h3>
        </div>
        <p className="text-[#353535] mb-4">Задача успешно перенесена на следующую встречу.</p>
        <p className="text-[14px] text-gray-500 bg-gray-50 rounded-lg p-3 mb-6">{taskDescription}</p>
        <button onClick={onClose} className="w-full py-2.5 px-4 bg-[#000150] text-white rounded-xl font-medium hover:bg-blue-900 transition-colors">ОК</button>
      </div>
    </div>
  );
}

interface MoveTaskConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskDescription: string;
}

function MoveTaskConfirmModal({ isOpen, onClose, onConfirm, taskDescription }: MoveTaskConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#000150]/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-[#000150]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#000150]">Перенос задачи</h3>
        </div>
        <p className="text-[#353535] mb-4">Вы действительно хотите перенести эту задачу на следующую встречу?</p>
        <p className="text-[14px] text-gray-500 bg-gray-50 rounded-lg p-3 mb-6">{taskDescription}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 px-4 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors">Отмена</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 px-4 bg-[#000150] text-white rounded-xl font-medium hover:bg-blue-900 transition-colors">Перенести</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Модальное окно для добавления ссылки-артефакта
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
// Компонент карточки артефакта (файлы + ссылки)
// ─────────────────────────────────────────────

interface ArtifactCardProps {
  artifact: Artifact;
  meetingId: string;
  onDetach: (artifactId: string) => void;
  isDetaching?: boolean;
}

function ArtifactCard({ artifact, meetingId, onDetach, isDetaching }: ArtifactCardProps) {
  const iconType = getFileIconType(artifact);
  const isLink = artifact.type === 'LINK' || (!!artifact.link_url && !artifact.s3_key);

  // Получаем URL для скачивания
  const downloadUrl = getArtifactDownloadUrl(artifact);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    
    if (isLink && artifact.link_url) {
      e.preventDefault();
      window.open(artifact.link_url, '_blank', 'noopener,noreferrer');
    } else if (downloadUrl) {
      // Скачиваем только если есть валидный URL
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
          
          {/* Кнопка/подсказка действия */}
          <span className={`inline-flex items-center gap-1 text-sm mt-2 ${isLink ? 'text-blue-600' : 'text-[#000150]/70'}`}>
            {isLink ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Открыть ссылку
              </>
            ) : artifact.file_url ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Нажмите для скачивания
              </>
            ) : null}
          </span>
        </div>
        
        {/* Кнопка удаления (не блокирует клик по карточке) */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Чтобы не сработал клик по карточке
            onDetach(artifact.id);
          }}
          disabled={isDetaching}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Удалить артефакт из встречи"
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

function Section({ title, content, isEmpty = false }: { title: string; content: string; isEmpty?: boolean }) {
  return (
    <div className="border-b border-gray-300/40 pb-4.5">
      <h2 className="text-[24px] text-[#000150] font-medium mb-3">{title}</h2>
      <p className={`text-[22px] leading-relaxed whitespace-pre-wrap ${isEmpty ? 'text-gray-400 italic' : ''}`}>
        {content}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Основной компонент страницы
// ─────────────────────────────────────────────

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskToMove, setTaskToMove] = useState<Task | null>(null);
  
  // Артефакты
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [artifactsLoading, setArtifactsLoading] = useState(false);
  const [artifactsError, setArtifactsError] = useState<string | null>(null);
  const [detachingArtifactId, setDetachingArtifactId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Новое состояние для модального окна добавления ссылки
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isCompleteTaskModalOpen, setIsCompleteTaskModalOpen] = useState(false);
  const [isMoveSuccessModalOpen, setIsMoveSuccessModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
  const [movedTaskDescription, setMovedTaskDescription] = useState<string>('');
  
  const { isAuthenticated } = useAuth();

  // Загрузка задач
  const fetchTasks = useCallback(async () => {
    try {
      setTasksLoading(true);
      setTasksError(null);
      const tasksData = await getTasks({ meeting_id: id });
      const uniqueTasks = Array.from(new Map(tasksData.map(task => [task.id, task])).values());
      setTasks(uniqueTasks);
    } catch (err: any) {
      console.warn('Failed to load tasks (soft failure):', err);
      setTasksError(err.message || 'Не удалось загрузить задачи');
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, [id]);

  // Загрузка студентов
  const fetchStudents = useCallback(async () => {
    try {
      setStudentsError(null);
      const studentsData = await getTeamStudents(meeting!.team_id);
      setStudents(studentsData);
    } catch (err: any) {
      console.warn('Failed to load students (soft failure):', err);
      setStudentsError('Не удалось загрузить участников');
      setStudents([]);
    }
  }, [meeting]);

  // Загрузка артефактов
  const fetchArtifacts = useCallback(async () => {
    try {
      setArtifactsLoading(true);
      setArtifactsError(null);
      const artifactsData = await getArtifacts({ meeting_id: id });
      setArtifacts(artifactsData);
    } catch (err: any) {
      console.warn('Failed to load artifacts (soft failure):', err);
      setArtifactsError('Не удалось загрузить артефакты');
      setArtifacts([]);
    } finally {
      setArtifactsLoading(false);
    }
  }, [id]);

  // Загрузка основных данных
  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchCriticalData = async () => {
      try {
        setLoading(true);
        setError(null);
        const meetingData = await getMeetingById(id);
        setMeeting(meetingData);
        const teamData = await getTeamById(meetingData.team_id);
        setTeam(teamData);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки данных встречи');
        console.error('Critical data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCriticalData();
  }, [isAuthenticated, id]);

  // Загрузка зависимых данных
  useEffect(() => {
    if (meeting?.team_id) {
      fetchStudents();
      fetchTasks();
      fetchArtifacts();
    }
  }, [meeting, fetchStudents, fetchTasks, fetchArtifacts]);

  // Удаление встречи
  const handleDeleteMeeting = async () => {
    try {
      await deleteMeeting(id);
      router.push('/teams');
    } catch (err: any) {
      console.error('Meeting deletion error:', err);
      setError(err.message || 'Ошибка при удалении встречи');
    }
  };

  // Добавление задачи
  const handleAddTask = async (description: string) => {
    try {
      await addTaskToMeeting(id, { description });
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchTasks();
      setIsTaskModalOpen(false);
    } catch (err: any) {
      console.error('Task creation error:', err);
      fetchTasks().catch(() => {});
      setTasksError(err.message || 'Ошибка при создании задачи');
    }
  };

  // Удаление задачи
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await removeTaskFromMeeting(id, taskToDelete.id);
      await fetchTasks();
      setIsDeleteTaskModalOpen(false);
      setTaskToDelete(null);
    } catch (err: any) {
      console.error('Task removal error:', err);
      setTasksError(err.message || 'Ошибка при удалении задачи');
    }
  };

  // Обновление задачи
  const handleTaskUpdated = useCallback((updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  }, []);

  // Перенос задачи
  const handleMoveTaskClick = (task: Task) => setTaskToMove(task);

  const handleConfirmMoveTask = async () => {
    if (!taskToMove) return;
    try {
      await moveTaskToNextMeeting(taskToMove.id);
      setMovedTaskDescription(taskToMove.description);
      setIsMoveSuccessModalOpen(true);
      await fetchTasks();
      setTaskToMove(null);
    } catch (err: any) {
      console.error('Task move error:', err);
      setTasksError(err.message || 'Ошибка при переносе задачи');
      setTaskToMove(null);
    }
  };

  // Выполнение задачи
  const handleCompleteTask = async (taskId: string) => {
    try {
      await updateTask(taskId, { is_completed: true });
      await fetchTasks();
    } catch (err: any) {
      console.error('Task completion error:', err);
      setTasksError(err.message || 'Ошибка при отметке задачи как выполненной');
    }
  };

  // Загрузка файла-артефакта
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !meeting) return;

    try {
      setArtifactsLoading(true);
      setArtifactsError(null);
      await uploadMeetingArtifact(meeting.id, file);
      await fetchArtifacts();
      // Сброс input, чтобы можно было выбрать тот же файл повторно
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error('Artifact upload error:', err);
      setArtifactsError(err.message || 'Ошибка при загрузке файла');
    } finally {
      setArtifactsLoading(false);
    }
  };

  // Обработчик добавления ссылки-артефакта
  const handleAddLinkArtifact = async (linkUrl: string, name?: string) => {
    if (!meeting) return;
    try {
      setArtifactsLoading(true);
      setArtifactsError(null);
      await addMeetingLinkArtifact(meeting.id, linkUrl, name);
      await fetchArtifacts();
    } catch (err: any) {
      console.error('Link artifact error:', err);
      setArtifactsError(err.message || 'Ошибка при добавлении ссылки');
    } finally {
      setArtifactsLoading(false);
    }
  };

  // Открепление артефакта
  const handleDetachArtifact = async (artifactId: string) => {
    if (!meeting) return;
    try {
      setDetachingArtifactId(artifactId);
      await detachArtifact(artifactId, 'MEETING', meeting.id);
      await fetchArtifacts();
    } catch (err: any) {
      console.error('Artifact detach error:', err);
      setArtifactsError(err.message || 'Ошибка при удалении артефакта');
    } finally {
      setDetachingArtifactId(null);
    }
  };

  // Статус встречи
  const getMeetingStatusDisplay = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED': return 'Запланирована';
      case 'COMPLETED': return 'Завершена';
      case 'CANCELED': return 'Отменена';
      case 'IN_PROGRESS': return 'В работе';
      default: return 'Запланирована';
    }
  };

  // Заглушки
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col gap-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="space-y-6 mt-8">
          {[...Array(3)].map((_, i) => (
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

  if (!meeting || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#000150]">Встреча не найдена</div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Рендер страницы
  // ─────────────────────────────────────────────

  return (
    <>
      <div className="space-y-8">
        {/* Заголовок встречи */}
        <div>
          <div className="mb-3">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-[#000150] text-[26px] font-semibold">{meeting.name}</h1>
              {isAuthenticated && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center ml-auto bg-[#000150]/20 px-4 py-2 rounded-[20px] text-[#000150] text-[19px] font-semibold max-h-11.75 hover:bg-[#000150]/30 transition-colors"
                    title="Редактировать встречу"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    title="Удалить встречу"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <p><span className="text-[24px] text-[#000150]">Команда: <span className="font-medium">{team.name}</span></span></p>
            <div className="px-3 py-px bg-[#E79E00]/20 rounded-lg">
              <span className="text-[#E79E00] text-[20px] font-medium">
                {new Date(meeting.date).toLocaleDateString('ru-RU')} в {new Date(meeting.date).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            <div className="px-3 py-px bg-[#000150]/10 rounded-lg">
              <span className="text-[#000150] text-[18px] font-medium">
                {getMeetingStatusDisplay(meeting.status)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Резюме */}
        <div className="flex flex-col gap-9">
          <Section 
            title={"Резюме"} 
            content={meeting.resume || "Добавьте описание встречи"} 
            isEmpty={!meeting.resume}
          />
        </div>

        {/* Участники */}
        <div className="mb-12">
          <h2 className="text-[24px] text-[#000150] font-medium mb-7">Участники команды</h2>
          {studentsError ? (
            <div className="p-3 bg-yellow-50 text-yellow-800 rounded text-sm">{studentsError}</div>
          ) : students.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {students.map((student, index) => (
                <li key={`meeting-student-${student.id}-${index}`} className="flex gap-4 items-center">
                  <span className="w-9 h-9 flex items-center justify-center bg-[#000150]/10 rounded-full text-[#000150] text-[20px] mb-0.5">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-[20px]">
                    {student.last_name} {student.first_name} {student.patronymic || ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500"><p>В этой команде пока нет участников</p></div>
          )}
        </div>

        {/* Задачи */}
        <div className="mt-9">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[24px] text-[#000150] font-medium">Задачи встречи</h2>
            {isAuthenticated && (
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="flex gap-2 items-center px-4 py-2 bg-[#000150] text-white rounded-[20px] hover:bg-blue-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Добавить
              </button>
            )}
          </div>
          
          <div className="flex items-center mb-6">
            <p className="text-[18px] text-[#353535]">Задач найдено: <span className="text-[18px] text-[#000150] font-semibold">{tasks.length}</span></p>
          </div>

          {tasksError && <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded text-sm">{tasksError}</div>}
          
          {tasksLoading ? (
            <p className="text-gray-500">Загрузка задач...</p>
          ) : tasks.length > 0 ? (
            <ul className="space-y-4">
              {tasks.map((task) => (
                <li 
                  key={task.id} 
                  className={`flex items-center justify-between p-4 rounded-xl border border-gray-200 transition-all relative group ${task.is_completed ? 'bg-green-50/50 backdrop-blur-[2px] border-green-200' : 'bg-white hover:shadow-md'}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => { if (!task.is_completed) { setTaskToComplete(task); setIsCompleteTaskModalOpen(true); } }}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${task.is_completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-[#000150] hover:bg-[#000150]/5'}`}
                      title={task.is_completed ? 'Задача выполнена' : 'Отметить как выполненную'}
                      disabled={task.is_completed}
                    >
                      {task.is_completed && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className={`text-[18px] ${task.is_completed ? 'text-gray-500/70' : 'text-gray-800'}`}>{task.description}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setTaskToEdit(task); setIsEditTaskModalOpen(true); }} className="p-1 text-gray-500 hover:text-[#000150] transition-colors" title="Редактировать задачу">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleMoveTaskClick(task)} className="p-1 text-gray-500 hover:text-[#000150] transition-colors" title="Перенести на следующую встречу">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                    <button onClick={() => { setTaskToDelete(task); setIsDeleteTaskModalOpen(true); }} className="p-1 text-gray-500 hover:text-red-500 transition-colors" title="Убрать задачу со встречи">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500"><p>Для этой встречи еще нет задач</p></div>
          )}
        </div>

        {/* секция артефактов */}
        <div className="mt-9">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[24px] text-[#000150] font-medium">Артефакты</h2>
            {isAuthenticated && (
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
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artifacts.map((artifact) => (
                <ArtifactCard
                  key={artifact.id}
                  artifact={artifact}
                  meetingId={meeting.id}
                  onDetach={handleDetachArtifact}
                  isDetaching={detachingArtifactId === artifact.id}
                />
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">
              <p>К этой встрече еще не прикреплены артефакты</p>
              {isAuthenticated && (
                <p className="mt-2 text-sm text-[#000150]/70">Нажмите «Файл» или «Ссылка» чтобы добавить артефакт</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Модальные окна */}
      <EditMeetingForm 
      isOpen={isEditModalOpen} 
      onClose={() => setIsEditModalOpen(false)} 
      meetingId={meeting.id} 
      initialData={meeting} />

      <DeleteMeetingModal 
      isOpen={isDeleteModalOpen} 
      onClose={() => setIsDeleteModalOpen(false)} 
      meetingId={meeting.id} 
      meetingName={meeting.name} 
      onConfirm={handleDeleteMeeting} />

      <TaskFormModal 
      isOpen={isTaskModalOpen} 
      onClose={() => setIsTaskModalOpen(false)} 
      onAddTask={handleAddTask} />

      <DeleteTaskModal 
      isOpen={isDeleteTaskModalOpen} 
      onClose={() => { setIsDeleteTaskModalOpen(false); setTaskToDelete(null); }} 
      taskId={taskToDelete?.id || ''} 
      taskDescription={taskToDelete?.description || ''} 
      onConfirm={handleDeleteTask} />

      {taskToEdit && 
      <EditTaskModal 
      isOpen={isEditTaskModalOpen} 
      onClose={() => { setIsEditTaskModalOpen(false); setTaskToEdit(null); }} 
      task={taskToEdit} 
      onTaskUpdated={handleTaskUpdated} />}

      {taskToComplete && 
      <CompleteTaskModal 
      isOpen={isCompleteTaskModalOpen} 
      onClose={() => { setIsCompleteTaskModalOpen(false); setTaskToComplete(null); }} 
      task={taskToComplete} 
      onConfirm={() => handleCompleteTask(taskToComplete.id)} />}

      {taskToMove && 
      <MoveTaskConfirmModal 
      isOpen={!!taskToMove} 
      onClose={() => setTaskToMove(null)} 
      onConfirm={handleConfirmMoveTask} 
      taskDescription={taskToMove.description} />}

      <TaskMoveSuccessModal 
      isOpen={isMoveSuccessModalOpen} 
      onClose={() => { setIsMoveSuccessModalOpen(false); setMovedTaskDescription(''); }} 
      taskDescription={movedTaskDescription} />

      {/* Модальное окно добавления ссылки */}
      <AddLinkArtifactModal 
        isOpen={isAddLinkModalOpen} 
        onClose={() => setIsAddLinkModalOpen(false)} 
        onConfirm={handleAddLinkArtifact}
        isLoading={artifactsLoading} 
      />
    </>
  );
}