'use client';

import { useState, useEffect } from 'react';
import { Meeting, getMeetingById, deleteMeeting, updateMeeting } from "@/lib/api/meetings";
import { Team, getTeamById } from "@/lib/api/teams";
import { TeamStudent, getFullTeamStudents } from "@/lib/api/students";
import { Task, getTasksByMeetingId, createTask, deleteTask } from "@/lib/api/meetings";
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
  const [students, setStudents] = useState<TeamStudent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
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
        const meetingData = await getMeetingById(id);
        setMeeting(meetingData);
        
        // получаем данные о команде
        const teamData = await getTeamById(meetingData.team_id);
        setTeam(teamData);
        
        // получаем участников команды
        const studentsData = await getFullTeamStudents(meetingData.team_id);
        setStudents(studentsData);
        
        // получаем задачи для встречи
        const tasksData = await getTasksByMeetingId(id);
        setTasks(tasksData);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки данных встречи');
        console.error('Meeting data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingData();
  }, [isAuthenticated, id]);

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
      const newTask = await createTask(id, { description });
      setTasks(prev => [...prev, newTask]);
    } catch (err: any) {
      console.error('Task creation error:', err);
      setError(err.message || 'Ошибка при создании задачи');
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      await deleteTask(id, taskToDelete.id);
      setTasks(prev => prev.filter(task => task.id !== taskToDelete.id));
      setIsDeleteTaskModalOpen(false);
      setTaskToDelete(null);
    } catch (err: any) {
      console.error('Task deletion error:', err);
      setError(err.message || 'Ошибка при удалении задачи');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col gap-6">
        {/* Ghost загрузки */}
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
        
        <div className="space-y-6 mt-8">
          <div className="space-y-4">
            <div className="h-7 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
          
          <div className="space-y-4">
            <div className="h-7 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>
          
          <div className="space-y-4">
            <div className="h-7 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        </div>
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
          <div className="flex items-center gap-[24px]">
            <p><span className="text-[24px] text-[#000150]">Команда: <span className="font-medium">{team.name}</span></span></p>
            <div className="px-3 py-[1px] bg-[#E79E00]/20 rounded-[8px]">
              <span className="text-[#E79E00] text-[20px] font-medium">
                {new Date(meeting.date).toLocaleDateString()} в {new Date(meeting.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-[36px]">
          <Section title={"Резюме"} content={meeting.resume} />
        </div>
        
        {/* Блок участников команды */}
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
                  <span className="font-semibold text-center w-[124px] ml-auto px-3 py-1 bg-[#000150]/20 rounded-[16px] text-[#000150]">
                    {student.study_group || 'не указана'}
                  </span>
                  <span className="font-semibold text-center w-[124px] ml-[72px] px-3 py-1 bg-[#000150]/20 rounded-[16px] text-[#000150]">
                    {student.role || 'не указана'}
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
        
        {/* Блок задач встречи */}
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
                    <div className="flex items-start gap-3">
                        {/* <input
                            type="checkbox"
                            checked={task.is_completed}
                            aria-label={`Задача "${task.description}" ${task.is_completed ? 'выполнена' : 'не выполнена'}`}
                            className="w-5 h-5 rounded border-gray-300 text-[#000150] focus:ring-[#000150]"
                            disabled
                        /> */}
                        <span className={`text-[18px] ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {task.description}
                        </span>
                    </div>
                    <button
                        onClick={() => {
                        setTaskToDelete(task);
                        setIsDeleteTaskModalOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-500 transition-colors"
                        title="Удалить задачу"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">
              <p>Для этой встречи еще нет задач</p>
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
    </>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="">
      <h2 className="text-[24px] text-[#000150] font-medium mb-[28px]">{title}</h2>
      <p className="text-[22px] leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}