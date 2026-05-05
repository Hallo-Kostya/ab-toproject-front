'use client';

import { useState, useEffect } from 'react';
import Modal from "@/components/ui/modal";
import { Student } from "@/types/students/student";
import { getStudents } from "@/lib/api/students";
import { addStudentToTeam } from '@/lib/api/teams';
import { AddStudentToTeamData } from "@/lib/api/teams";

interface AddStudentToTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onStudentAdded: () => void;
}

export default function AddStudentToTeamModal({ isOpen, onClose, teamId, onStudentAdded }: AddStudentToTeamModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [role, setRole] = useState('Участник');
  const [studyGroup, setStudyGroup] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const data = await getStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки студентов');
      console.error('Students fetch error:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    setIsLoading(true);
    setError('');

    try {
      const studentData: AddStudentToTeamData = {
        student_id: selectedStudentId,
        role,
        study_group: studyGroup
      };

      await addStudentToTeam(teamId, studentData);
      
      onStudentAdded();
      onClose();
      
      setSelectedStudentId(null);
      setRole('Участник');
      setStudyGroup('');
      
    } catch (err: any) {
      setError(err.message || 'Ошибка при добавлении студента в команду');
      console.error('Add student to team error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="px-20">
      <div className="p-6 bg-white rounded-3xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Закрыть"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl text-[#000150] font-bold mb-4">Добавить участника в команду</h2>
        <p className="mb-6 text-gray-600">Выберите студента из списка</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {loadingStudents ? (
          <div className="text-center py-8">
            <div className="text-xl text-[#000150]">Загрузка студентов...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-[16px] font-medium text-[#000150]">Выберите студента *</label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-xl p-2">
                {students.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Нет доступных студентов</p>
                ) : (
                  students.map((student) => (
                    <button
                      key={student.id || `student-${student.email}-${student.last_name}`}
                      type="button"
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg mb-1 transition-colors ${
                        selectedStudentId === student.id
                          ? 'bg-[#000150] text-white'
                          : 'hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      {student.last_name} {student.first_name} {student.patronymic || ''}
                      <span className="block text-sm text-gray-400">{student.email}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="role" className="block mb-1 text-[16px] font-medium text-[#000150]">Роль в команде</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              >
                <option value="">Не указано</option>
                <option value="Участник">Участник</option>
                <option value="Тимлид">Тимлид</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="studyGroup" className="block mb-1 text-[16px] font-medium text-[#000150]">Учебная группа</label>
              <input
                type="text"
                id="studyGroup"
                value={studyGroup}
                onChange={(e) => setStudyGroup(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
                placeholder="Введите номер группы"
              />
            </div>
            
            <div className="flex ml-auto gap-4 mt-10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-2xl font-medium hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isLoading || !selectedStudentId}
                className="flex-1 py-2 px-4 bg-[#000150] text-white rounded-2xl font-medium hover:bg-blue-900 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Добавление...' : 'Добавить участника'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}