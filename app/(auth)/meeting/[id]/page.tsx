'use client';

import { useState, useEffect } from 'react';
import { 
  Meeting, 
  getMeetingById, 
  deleteMeeting, 
  updateMeeting,
  addTaskToMeeting,
  removeTaskFromMeeting
} from "@/lib/api/meetings";
import { Task, getTasks, createTask, deleteTask, moveTaskToNextMeeting } from "@/lib/api/tasks";
import { Artifact, getArtifact, deleteArtifact, attachArtifactToMeeting, detachArtifactFromMeeting } from "@/lib/api/artifacts";
import { Team, getTeamById } from "@/lib/api/teams";
import { Student, getTeamStudents } from "@/lib/api/students";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from 'next/navigation';
import Modal from "@/components/ui/modal";
import EditMeetingForm from '@/components/forms/editMeetingForm';
import DeleteMeetingModal from '@/components/ui/deleteMeetingModal';
import TaskFormModal from '@/components/ui/taskFormModal';
import DeleteTaskModal from '@/components/ui/deleteTaskModal';

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchMeetingData = async () => {
      try {
        setLoading(true);
        
        // 1. Данные встречи
        const meetingData = await getMeetingById(id);
        setMeeting(meetingData);
        
        // 2. Данные команды
        const teamData = await getTeamById(meetingData.team_id);
        setTeam(teamData);
        
        // 3. Студенты команды (возвращает Student[])
        const studentsData = await getTeamStudents(meetingData.team_id);
        setStudents(studentsData);
        
        // 4. Задачи встречи (фильтр по meeting_id)
        const tasksData = await getTasks({ meeting_id: id });
        setTasks(tasksData);
        
        // 5. Артефакты встречи (заглушка — если бекенд вернёт эндпоинт)
        // const artifactsData = await getArtifacts({ meeting_id: id });
        // setArtifacts(artifactsData);
        
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки данных встречи');
        console.error('Meeting data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingData();
  }, [isAuthenticated, id]);

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

  // Добавление задачи: создаём + привязываем к встрече
  const handleAddTask = async (description: string) => {
    try {
      // Сначала создаём задачу (независимую сущность)
      const task = await createTask({ description });
      // Затем привязываем её к встрече
      await addTaskToMeeting(id, { description }); // или { task_id: task.id } если бекенд поддерживает
      // Обновляем список задач
      const updatedTasks = await getTasks({ meeting_id: id });
      setTasks(updatedTasks);
      setIsTaskModalOpen(false);
    } catch (err: any) {
      console.error('Task creation error:', err);
      setError(err.message || 'Ошибка при создании задачи');
    }
  };

  // Удаление задачи (только связь со встречей, не сама задача)
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      // Удаляем только связь задачи со встречей
      await removeTaskFromMeeting(id, taskToDelete.id);
      // Обновляем список
      const updatedTasks = await getTasks({ meeting_id: id });
      setTasks(updatedTasks);
      setIsDeleteTaskModalOpen(false);
      setTaskToDelete(null);
    } catch (err: any) {
      console.error('Task removal error:', err);
      setError(err.message || 'Ошибка при удалении задачи');
    }
  };

  // Перенос задачи на следующую встречу
  const handleMoveTaskToNextMeeting = async (taskId: string) => {
    try {
      await moveTaskToNextMeeting(taskId);
      // Обновляем список
      const updatedTasks = await getTasks({ meeting_id: id });
      setTasks(updatedTasks);
    } catch (err: any) {
      console.error('Task move error:', err);
      setError(err.message || 'Ошибка при переносе задачи');
    }
  };

  // Заглушка для загрузки артефакта (файл)
  const handleUploadArtifact = async (file: File, name?: string, description?: string) => {
    try {
      // const artifact = await uploadFileArtifact(file, {
      //   name,
      //   description,
      //   meeting_id: id
      // });
      // setArtifacts(prev => [...prev, artifact]);
      console.log('Upload artifact placeholder', { file, name, description, meeting_id: id });
    } catch (err: any) {
      console.error('Artifact upload error:', err);
      setError(err.message || 'Ошибка при загрузке артефакта');
    }
  };

  // Заглушка для удаления артефакта
  const handleDeleteArtifact = async (artifactId: string) => {
    try {
      await deleteArtifact(artifactId);
      setArtifacts(prev => prev.filter(a => a.id !== artifactId));
    } catch (err: any) {
      console.error('Artifact deletion error:', err);
      setError(err.message || 'Ошибка при удалении артефакта');
    }
  };

  // Маппинг статусов для отображения
  const getMeetingStatusDisplay = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED': return 'Запланирована';
      case 'COMPLETED': return 'Завершена';
      case 'CANCELLED': return 'Отменена';
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
        {/* Заголовок встречи */}
        <div>
          <div className="mb-3">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-[#000150] text-[26px] font-semibold">{meeting.name}</h1>
              {isAuthenticated && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center ml-auto bg-[#000150]/20 px-4 py-2 rounded-[20px] text-[#000150] text-[19px] font-semibold max-h-[47px] hover:bg-[#000150]/30 transition-colors"
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
          <div className="flex flex-wrap items-center gap-[24px]">
            <p><span className="text-[24px] text-[#000150]">Команда: <span className="font-medium">{team.name}</span></span></p>
            <div className="px-3 py-[1px] bg-[#E79E00]/20 rounded-[8px]">
              <span className="text-[#E79E00] text-[20px] font-medium">
                {new Date(meeting.date).toLocaleDateString('ru-RU')} в {new Date(meeting.date).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            <div className="px-3 py-[1px] bg-[#000150]/10 rounded-[8px]">
              <span className="text-[#000150] text-[18px] font-medium">
                {getMeetingStatusDisplay(meeting.status)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Резюме встречи */}
        <div className="flex flex-col gap-[36px]">
          <Section title={"Резюме"} content={meeting.resume} />
        </div>
        
        {/* Участники команды */}
        <div className="mb-12">
          <h2 className="text-[24px] text-[#000150] font-medium mb-[28px]">Участники команды</h2>
          {students.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {students.map((student, index) => (
                <li 
                  key={`meeting-student-${student.id}-${index}`} 
                  className="flex gap-4 items-center"
                >
                  <span className="w-9 h-9 flex items-center justify-center bg-[#000150]/10 rounded-full text-[#000150] text-[20px] mb-[2px]">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-[20px]">
                    {student.last_name} {student.first_name} {student.patronymic || ''}
                  </span>
                  {/* Если бекенд вернёт role/study_group */}
                  {/* <span className="font-semibold text-center w-[124px] ml-auto px-3 py-1 bg-[#000150]/20 rounded-[16px] text-[#000150]">
                    {(student as any).study_group || 'не указана'}
                  </span>
                  <span className="font-semibold text-center w-[124px] ml-[72px] px-3 py-1 bg-[#000150]/20 rounded-[16px] text-[#000150]">
                    {(student as any).role || 'не указана'}
                  </span> */}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">
              <p>В этой команде пока нет участников</p>
            </div>
          )}
        </div>
        
        {/* Задачи встречи */}
        <div className="mt-[36px]">
          <div className="flex items-center justify-between mb-[16px]">
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
          
          <div className="flex items-center mb-[24px]">
            <p className="text-[18px] text-[#353535]">Задач найдено: <span className="text-[18px] text-[#000150] font-semibold">{tasks.length}</span></p>
          </div>
          
          {tasks.length > 0 ? (
            <ul className="space-y-4">
              {tasks.map((task) => (
                <li 
                  key={task.id} 
                  className="flex items-center justify-between p-4 bg-white rounded-[12px] border border-gray-200 hover:shadow-md transition-shadow relative group"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className={`text-[18px] ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Кнопка переноса задачи (если бекенд поддерживает) */}
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

        {/* Артефакты встречи (заглушка) */}
        <div className="mt-[36px]">
          <div className="flex items-center justify-between mb-[16px]">
            <h2 className="text-[24px] text-[#000150] font-medium">Артефакты</h2>
            {isAuthenticated && (
              <button
                className="px-4 py-2 bg-[#000150]/20 text-[#000150] rounded-[20px] hover:bg-[#000150]/30 transition-colors"
                disabled // Раскомментировать, когда будет модальное окно
                title="Функционал в разработке"
              >
                + Добавить
              </button>
            )}
          </div>
          
          <div className="flex items-center mb-[24px]">
            <p className="text-[18px] text-[#353535]">Артефактов найдено: <span className="text-[18px] text-[#000150] font-semibold">{artifacts.length}</span></p>
          </div>
          
          {artifacts.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artifacts.map((artifact) => (
                <li key={artifact.id} className="p-4 bg-white rounded-[12px] border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-[#000150]">{artifact.name}</h4>
                      {artifact.description && (
                        <p className="text-sm text-gray-600 mt-1">{artifact.description}</p>
                      )}
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
                    {isAuthenticated && (
                      <button
                        onClick={() => handleDeleteArtifact(artifact.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Удалить артефакт"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
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
      
      {/* Модальные окна */}
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
    </>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="border-b border-gray-300/40 pb-[18px]">
      <h2 className="text-[24px] text-[#000150] font-medium mb-[12px]">{title}</h2>
      <p className="text-[22px] leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}