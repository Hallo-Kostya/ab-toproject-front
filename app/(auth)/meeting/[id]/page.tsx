'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Meeting, 
  getMeetingById, 
  deleteMeeting, 
  addTaskToMeeting,
  removeTaskFromMeeting
} from "@/lib/api/meetings";
import { Task, getTasks, moveTaskToNextMeeting, updateTask } from "@/lib/api/tasks";
import { Artifact } from "@/lib/api/artifacts";
import { Team, getTeamById } from "@/lib/api/teams";
import { Student, getTeamStudents } from "@/lib/api/students";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from 'next/navigation';
import EditMeetingForm from '@/components/forms/editMeetingForm';
import DeleteMeetingModal from '@/components/ui/deleteMeetingModal';
import TaskFormModal from '@/components/ui/taskFormModal';
import DeleteTaskModal from '@/components/ui/deleteTaskModal';
import EditTaskModal from '@/components/ui/editTaskModal';

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
        
        <p className="text-[#353535] mb-6">
          Вы действительно хотите отметить задачу как выполненную?
        </p>
        
        <p className="text-[16px] text-gray-600 bg-gray-50 rounded-lg p-3 mb-6">
          {task.description}
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            Подтвердить
          </button>
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
        
        <p className="text-[#353535] mb-4">
          Задача успешно перенесена на следующую встречу.
        </p>
        
        <p className="text-[14px] text-gray-500 bg-gray-50 rounded-lg p-3 mb-6">
          {taskDescription}
        </p>
        
        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-[#000150] text-white rounded-xl font-medium hover:bg-blue-900 transition-colors"
        >
          ОК
        </button>
      </div>
    </div>
  );
}

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
  
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

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

  const fetchTasks = useCallback(async () => {
    try {
      setTasksLoading(true);
      setTasksError(null);
      const tasksData = await getTasks({ meeting_id: id });

      const uniqueTasks = Array.from(
        new Map(tasksData.map(task => [task.id, task])).values()
      );
      
      setTasks(uniqueTasks);
    } catch (err: any) {
      console.warn('Failed to load tasks (soft failure):', err);
      setTasksError(err.message || 'Не удалось загрузить задачи');
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, [id]);

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

  useEffect(() => {
    if (meeting?.team_id) {
      fetchStudents();
      fetchTasks();
    }
  }, [meeting, fetchStudents, fetchTasks]);

  const handleDeleteMeeting = async () => {
    try {
      await deleteMeeting(id);
      router.push('/teams');
    } catch (err: any) {
      console.error('Meeting deletion error:', err);
      setError(err.message || 'Ошибка при удалении встречи');
    }
  };

  const handleAddTask = async (description: string) => {
    try {
      await addTaskToMeeting(id, { description });
      
      // Небольшая задержка перед обновлением списка, чтобы бекенд успел обработать
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchTasks();
      setIsTaskModalOpen(false);
    } catch (err: any) {
      console.error('Task creation error:', err);
      // Если задача создалась, но ответ был с ошибкой — всё равно обновляем список
      fetchTasks().catch(() => {});
      setTasksError(err.message || 'Ошибка при создании задачи');
    }
  };

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

  const handleTaskUpdated = useCallback((updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  }, []);

  const handleMoveTaskToNextMeeting = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    try {
      await moveTaskToNextMeeting(taskId);
      
      // Сохраняем описание для отображения в модальном окне
      if (task) {
        setMovedTaskDescription(task.description);
      }
      
      // Показываем модальное окно об успехе
      setIsMoveSuccessModalOpen(true);
      
      // Обновляем список задач
      await fetchTasks();
    } catch (err: any) {
      console.error('Task move error:', err);
      setTasksError(err.message || 'Ошибка при переносе задачи');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await updateTask(taskId, { is_completed: true });
      await fetchTasks();
    } catch (err: any) {
      console.error('Task completion error:', err);
      setTasksError(err.message || 'Ошибка при отметке задачи как выполненной');
    }
  };

  const getMeetingStatusDisplay = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED': return 'Запланирована';
      case 'COMPLETED': return 'Завершена';
      case 'CANCELED': return 'Отменена';
      case 'IN_PROGRESS': return 'В работе';
      default: return 'Запланирована';
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

  return (
    <>
      <div className="space-y-8">
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
        
        <div className="flex flex-col gap-9">
          <Section 
            title={"Резюме"} 
            content={meeting.resume || "Добавьте описание встречи"} 
            isEmpty={!meeting.resume}
          />
        </div>

        <div className="mb-12">
          <h2 className="text-[24px] text-[#000150] font-medium mb-7">Участники команды</h2>
          {studentsError ? (
            <div className="p-3 bg-yellow-50 text-yellow-800 rounded text-sm">
              {studentsError}
            </div>
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
            <div className="text-gray-500">
              <p>В этой команде пока нет участников</p>
            </div>
          )}
        </div>

        <div className="mt-9">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[24px] text-[#000150] font-medium">Задачи встречи</h2>
            {isAuthenticated && (
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-4 py-2 bg-[#000150] text-white rounded-[20px] hover:bg-blue-900 transition-colors"
              >
                + Добавить
              </button>
            )}
          </div>
          
          <div className="flex items-center mb-6">
            <p className="text-[18px] text-[#353535]">Задач найдено: <span className="text-[18px] text-[#000150] font-semibold">{tasks.length}</span></p>
          </div>

          {tasksError && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded text-sm">
              {tasksError}
            </div>
          )}
          
          {tasksLoading ? (
            <p className="text-gray-500">Загрузка задач...</p>
          ) : tasks.length > 0 ? (
            <ul className="space-y-4">
              {tasks.map((task) => (
                <li 
                  key={task.id} 
                  className={`
                    flex items-center justify-between p-4 rounded-xl border border-gray-200 
                    transition-all relative group
                    ${task.is_completed 
                      ? 'bg-green-50/50 backdrop-blur-[2px] border-green-200' 
                      : 'bg-white hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => {
                        if (!task.is_completed) {
                          setTaskToComplete(task);
                          setIsCompleteTaskModalOpen(true);
                        }
                      }}
                      className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                        ${task.is_completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-[#000150] hover:bg-[#000150]/5'
                        }
                      `}
                      title={task.is_completed ? 'Задача выполнена' : 'Отметить как выполненную'}
                      disabled={task.is_completed}
                    >
                      {task.is_completed && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className={`text-[18px] ${task.is_completed ? 'text-gray-500/70' : 'text-gray-800'}`}>
                      {task.description}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setTaskToEdit(task);
                        setIsEditTaskModalOpen(true);
                      }}
                      className="p-1 text-gray-500 hover:text-[#000150] transition-colors"
                      title="Редактировать задачу"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleMoveTaskToNextMeeting(task.id)}
                      className="p-1 text-gray-500 hover:text-[#000150] transition-colors"
                      title="Перенести на следующую встречу"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => {
                        setTaskToDelete(task);
                        setIsDeleteTaskModalOpen(true);
                      }}
                      className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                      title="Убрать задачу со встречи"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">
              <p>Для этой встречи еще нет задач</p>
            </div>
          )}
        </div>

        <div className="mt-9">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[24px] text-[#000150] font-medium">Артефакты</h2>
            {isAuthenticated && (
              <button
                className="px-4 py-2 bg-[#000150]/20 text-[#000150] rounded-[20px] hover:bg-[#000150]/30 transition-colors"
                disabled
                title="Функционал в разработке"
              >
                + Добавить
              </button>
            )}
          </div>
          
          <div className="flex items-center mb-6">
            <p className="text-[18px] text-[#353535]">Артефактов найдено: <span className="text-[18px] text-[#000150] font-semibold">{artifacts.length}</span></p>
          </div>
          
          {artifacts.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artifacts.map((artifact) => (
                <li key={artifact.id} className="p-4 bg-white rounded-xl border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-[#000150]">{artifact.name}</h4>
                      {artifact.description && <p className="text-sm text-gray-600 mt-1">{artifact.description}</p>}
                      {artifact.file_url && (
                        <a href={artifact.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#000150] hover:underline mt-2 inline-block">
                          📎 Скачать файл
                        </a>
                      )}
                      {artifact.link_url && (
                        <a href={artifact.link_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#000150] hover:underline mt-2 inline-block">
                          🔗 Открыть ссылку
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">
              <p>К этой встрече еще не прикреплены артефакты</p>
            </div>
          )}
        </div>
      </div>
      
      <EditMeetingForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        meetingId={meeting.id}
        initialData={meeting}
      />
      
      <DeleteMeetingModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        meetingId={meeting.id}
        meetingName={meeting.name}
        onConfirm={handleDeleteMeeting}
      />
      
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />
      
      <DeleteTaskModal
        isOpen={isDeleteTaskModalOpen}
        onClose={() => {
          setIsDeleteTaskModalOpen(false);
          setTaskToDelete(null);
        }}
        taskId={taskToDelete?.id || ''}
        taskDescription={taskToDelete?.description || ''}
        onConfirm={handleDeleteTask}
      />

      {taskToEdit && (
        <EditTaskModal
          isOpen={isEditTaskModalOpen}
          onClose={() => {
            setIsEditTaskModalOpen(false);
            setTaskToEdit(null);
          }}
          task={taskToEdit}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      {taskToComplete && (
        <CompleteTaskModal
          isOpen={isCompleteTaskModalOpen}
          onClose={() => {
            setIsCompleteTaskModalOpen(false);
            setTaskToComplete(null);
          }}
          task={taskToComplete}
          onConfirm={() => handleCompleteTask(taskToComplete.id)}
        />
      )}

      <TaskMoveSuccessModal
        isOpen={isMoveSuccessModalOpen}
        onClose={() => {
          setIsMoveSuccessModalOpen(false);
          setMovedTaskDescription('');
        }}
        taskDescription={movedTaskDescription}
      />
    </>
  );
}

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